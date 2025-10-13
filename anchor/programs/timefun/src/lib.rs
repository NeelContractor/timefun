#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken, 
    token::{self, Burn, Mint, MintTo, Token, TokenAccount}
};

declare_id!("FnKzNmfGD2EZdgRag4ef5zYcFJPXVHzNRUrpM4Q7gdFX");

#[program]
pub mod timefun {
    use super::*;

    pub fn initialize_creator(
        ctx: Context<InitializeCreatorProfile>,
        base_price: u64,
        chars_per_token: u64,
        name: String,
        bio: String,
        category: Category,
        image: String,
        social_link: String,
    ) -> Result<()> {
        let creator_profile = &mut ctx.accounts.creator_profile;
        creator_profile.creator = ctx.accounts.creator.key();
        creator_profile.creator_token_mint = ctx.accounts.creator_token_mint.key();
        creator_profile.base_per_token = base_price;
        creator_profile.chars_per_token = chars_per_token;
        creator_profile.name = name;
        creator_profile.bio = bio;
        creator_profile.category = category;
        creator_profile.image = image;
        creator_profile.social_link = social_link;
        creator_profile.total_supply = 0;
        creator_profile.bump = ctx.bumps.creator_profile;
        Ok(())
    }

    pub fn buy_tokens(
        ctx: Context<BuyTokens>,
        amount: u64,
    ) -> Result<()> {
        let creator_profile = &mut ctx.accounts.creator_profile;
        
        // Calculate price with bonding curve logic
        let price = calculate_buy_price(
            creator_profile.total_supply,
            amount,
            creator_profile.base_per_token
        )?;
        
        // Transfer SOL from buyer to creator
        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            anchor_lang::system_program::Transfer {
                from: ctx.accounts.buyer.to_account_info(),
                to: ctx.accounts.vault.to_account_info(),
            },
        );
        anchor_lang::system_program::transfer(cpi_context, price)?;
        
        // Mint tokens to buyer
        let creator_key = creator_profile.creator;
        let seeds = &[
            b"creator_profile",
            creator_key.as_ref(),
            &[creator_profile.bump],
        ];
        let signer = &[&seeds[..]];
        
        let cpi_accounts = MintTo {
            mint: ctx.accounts.creator_token_mint.to_account_info(),
            to: ctx.accounts.buyer_token_account.to_account_info(),
            authority: creator_profile.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        
        token::mint_to(cpi_ctx, amount)?;
        
        // Update total supply
        creator_profile.total_supply = creator_profile.total_supply
            .checked_add(amount)
            .ok_or(TimeFunError::Overflow)?;
        
        Ok(())
    }

    pub fn sell_tokens(
        ctx: Context<SellTokens>,
        amount: u64,
    ) -> Result<()> {
        let creator_profile = &mut ctx.accounts.creator_profile;
        
        // Calculate refund price (slightly lower than buy price)
        let refund = calculate_sell_price(
            creator_profile.total_supply,
            amount,
            creator_profile.base_per_token
        )?;

        // Check vault has enough SOL
        let vault_balance = ctx.accounts.vault.lamports();
        require!(
            vault_balance >= refund,
            TimeFunError::InsufficientVaultBalance
        );
        
        // Burn tokens from seller
        let cpi_accounts = Burn {
            mint: ctx.accounts.creator_token_mint.to_account_info(),
            from: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::burn(cpi_ctx, amount)?;

        // Transfer SOL refund from vault to seller using invoke_signed
        let creator_key = creator_profile.creator;
        let vault_seeds = &[
            b"vault",
            creator_key.as_ref(),
            &[ctx.bumps.vault],
        ];
        let vault_signer = &[&vault_seeds[..]];

        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.seller.to_account_info(),
                },
                vault_signer,
            ),
            refund,
        )?;
        
        // Update total supply
        creator_profile.total_supply = creator_profile.total_supply
            .checked_sub(amount)
            .ok_or(TimeFunError::Underflow)?;
        
        Ok(())
    }

    pub fn send_message(
        ctx: Context<SendMessage>,
        message_content: String,
    ) -> Result<()> {
        let creator_profile = &ctx.accounts.creator_profile;
        let message_length = message_content.len() as u64;
        
        // Calculate required tokens based on message length
        let tokens_required = (message_length + creator_profile.chars_per_token - 1) 
            / creator_profile.chars_per_token;
        
        // Check if user has enough tokens
        require!(
            ctx.accounts.user_token_account.amount >= tokens_required,
            TimeFunError::InsufficientTokens
        );
        
        // Burn tokens (consume them)
        let cpi_accounts = Burn {
            mint: ctx.accounts.creator_token_mint.to_account_info(),
            from: ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        
        token::burn(cpi_ctx, tokens_required)?;
        
        // Store/Update message in conversation account
        let conversation = &mut ctx.accounts.conversation;
        let is_new = conversation.user == Pubkey::default();
        
        if is_new {
            // First message - initialize conversation
            conversation.user = ctx.accounts.user.key();
            conversation.creator = creator_profile.creator;
            conversation.total_messages = 0; // Start at 0, will be incremented below
            conversation.bump = ctx.bumps.conversation;
        }
        
        // Store the message on-chain
        let message_account = &mut ctx.accounts.message_account;
        message_account.conversation = conversation.key();
        message_account.sender = ctx.accounts.user.key();
        message_account.message_content = message_content.clone();
        message_account.timestamp = Clock::get()?.unix_timestamp;
        message_account.tokens_burned = tokens_required;
        message_account.message_index = conversation.total_messages; // Use current count as index
        message_account.sender_type = MessageSender::User;
        message_account.bump = ctx.bumps.message_account;
        
        // Now increment total messages (only once!)
        conversation.total_messages = conversation.total_messages
            .checked_add(1)
            .ok_or(TimeFunError::Overflow)?;
        conversation.last_message_from = MessageSender::User;
        conversation.last_message_time = Clock::get()?.unix_timestamp;
        
        // Emit event for off-chain indexing
        emit!(MessageSent {
            conversation: ctx.accounts.conversation.key(),
            sender: ctx.accounts.user.key(),
            recipient: creator_profile.creator,
            message: message_content,
            tokens_burned: tokens_required,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Creator can withdraw SOL from vault
    pub fn withdraw_from_vault(
        ctx: Context<WithdrawFromVault>,
        amount: u64,
    ) -> Result<()> {
        let vault_balance = ctx.accounts.vault.lamports();
        
        require!(
            vault_balance >= amount,
            TimeFunError::InsufficientVaultBalance
        );
        // Transfer SOL from vault to creator using invoke_signed
        let creator_key = ctx.accounts.creator.key();
        let vault_seeds = &[
            b"vault",
            creator_key.as_ref(),
            &[ctx.bumps.vault],
        ];
        let vault_signer = &[&vault_seeds[..]];
        
        anchor_lang::system_program::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.system_program.to_account_info(),
                anchor_lang::system_program::Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.creator.to_account_info(),
                },
                vault_signer,
            ),
            amount,
        )?;

        Ok(())
    }

    // Creator replies without burning tokens (they own the tokens)
    // Creators DON'T need to own tokens to reply - it's completely FREE
    pub fn creator_reply_back(
        ctx: Context<CreatorReplyBack>,
        message_content: String,
    ) -> Result<()> {
        let conversation = &mut ctx.accounts.conversation;
        
        // Verify creator is replying to their own conversation
        require!(
            conversation.creator == ctx.accounts.creator.key(),
            TimeFunError::Unauthorized
        );
        
        // Verify conversation exists and has been initialized
        require!(
            conversation.user != Pubkey::default(),
            TimeFunError::ConversationNotInitialized
        );
        
        // NO TOKEN CHECK - Creators reply completely FREE
        // NO TOKEN BURNING - This is a service they provide
        // NO SOL COST - Only blockchain transaction fee
        
        // Update conversation metadata
        let message_account = &mut ctx.accounts.message_account;
        message_account.conversation = conversation.key();
        message_account.sender = ctx.accounts.creator.key();
        message_account.message_content = message_content.clone();
        message_account.timestamp = Clock::get()?.unix_timestamp;
        message_account.tokens_burned = 0;
        message_account.message_index = conversation.total_messages;
        message_account.sender_type = MessageSender::Creator;
        message_account.bump = ctx.bumps.message_account;
        
        conversation.last_message_from = MessageSender::Creator;
        conversation.last_message_time = Clock::get()?.unix_timestamp;
        conversation.total_messages = conversation.total_messages
            .checked_add(1)
            .ok_or(TimeFunError::Overflow)?;
        
        // Emit event for off-chain storage in database
        // tokensBurned = 0 indicates this is a creator reply
        emit!(MessageSent {
            conversation: conversation.key(),
            sender: ctx.accounts.creator.key(),
            recipient: conversation.user,
            message: message_content,
            tokens_burned: 0, // ZERO - creators don't burn tokens
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

// Bonding curve: price increases as supply increases
fn calculate_buy_price(current_supply: u64, amount: u64, base_price: u64) -> Result<u64> {
    // Simple linear bonding curve: price = base_price * (1 + supply/1000)
    let new_supply = current_supply.checked_add(amount).ok_or(TimeFunError::Overflow)?;
    let avg_supply = (current_supply + new_supply) / 2;
    let multiplier = 1000 + (avg_supply / 100); // Increases 1% per 100 tokens
    let price = (base_price as u128)
        .checked_mul(amount as u128)
        .and_then(|p| p.checked_mul(multiplier as u128))
        .and_then(|p| p.checked_div(1000))
        .ok_or(TimeFunError::Overflow)?;
    
    Ok(price as u64)
}

fn calculate_sell_price(current_supply: u64, amount: u64, base_price: u64) -> Result<u64> {
    // 95% of buy price to prevent arbitrage
    let buy_price = calculate_buy_price(current_supply.saturating_sub(amount), amount, base_price)?;
    Ok((buy_price as u128 * 95 / 100) as u64)
}

#[derive(Accounts)]
pub struct InitializeCreatorProfile<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        init,
        payer = creator,
        space = 8 + CreatorProfile::INIT_SPACE,
        seeds = [b"creator_profile", creator.key().as_ref()],
        bump
    )]
    pub creator_profile: Account<'info, CreatorProfile>,

    #[account(
        init,
        payer = creator,
        mint::decimals = 6,
        mint::authority = creator_profile,
        seeds = [b"creator_token_mint", creator.key().as_ref()],
        bump
    )]
    pub creator_token_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
pub struct BuyTokens<'info> {
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Creator receives SOL payment
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"creator_profile", creator.key().as_ref()],
        bump = creator_profile.bump
    )]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(
        mut,
        address = creator_profile.creator_token_mint
    )]
    pub creator_token_mint: Account<'info, Mint>,
    
    #[account(
        init_if_needed,
        payer = buyer,
        associated_token::mint = creator_token_mint,
        associated_token::authority = buyer
    )]
    pub buyer_token_account: Account<'info, TokenAccount>,

    /// CHECK: Vault PDA to hold SOL (program-controlled)
    #[account(
        mut,
        seeds = [b"vault", creator.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SellTokens<'info> {
    #[account(mut)]
    pub seller: Signer<'info>,
    
    /// CHECK: Creator pays refund
    #[account(mut)]
    pub creator: AccountInfo<'info>,
    
    #[account(
        mut,
        seeds = [b"creator_profile", creator.key().as_ref()],
        bump = creator_profile.bump
    )]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(
        mut,
        address = creator_profile.creator_token_mint
    )]
    pub creator_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = creator_token_mint,
        associated_token::authority = seller
    )]
    pub seller_token_account: Account<'info, TokenAccount>,

    /// CHECK: Vault PDA to refund SOL from (program-controlled)
    #[account(
        mut,
        seeds = [b"vault", creator.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct WithdrawFromVault<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    #[account(
        seeds = [b"creator_profile", creator.key().as_ref()],
        bump = creator_profile.bump,
        constraint = creator_profile.creator == creator.key() @ TimeFunError::Unauthorized
    )]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    /// CHECK: Vault PDA controlled by program
    #[account(
        mut,
        seeds = [b"vault", creator.key().as_ref()],
        bump
    )]
    pub vault: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct SendMessage<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    /// CHECK: Creator public key for PDA derivation
    pub creator: AccountInfo<'info>,
    
    #[account(
        seeds = [b"creator_profile", creator.key().as_ref()],
        bump = creator_profile.bump
    )]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(
        mut,
        address = creator_profile.creator_token_mint
    )]
    pub creator_token_mint: Account<'info, Mint>,
    
    #[account(
        mut,
        associated_token::mint = creator_token_mint,
        associated_token::authority = user
    )]
    pub user_token_account: Account<'info, TokenAccount>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Conversation::INIT_SPACE,
        seeds = [b"conversation", user.key().as_ref(), creator.key().as_ref()],
        bump
    )]
    pub conversation: Account<'info, Conversation>,

    #[account(
        init,
        payer = user,
        space = 8 + Message::INIT_SPACE,
        seeds = [
            b"message",
            conversation.key().as_ref(),
            &conversation.total_messages.to_le_bytes()
        ],
        bump
    )]
    pub message_account: Account<'info, Message>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreatorReplyBack<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    
    /// CHECK: User public key for PDA derivation
    pub user: AccountInfo<'info>,
    
    #[account(
        seeds = [b"creator_profile", creator.key().as_ref()],
        bump = creator_profile.bump,
    )]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(
        mut,
        seeds = [b"conversation", user.key().as_ref(), creator.key().as_ref()],
        bump = conversation.bump,
        constraint = conversation.creator == creator.key() @ TimeFunError::Unauthorized
    )]
    pub conversation: Account<'info, Conversation>,

    #[account(
        init,
        payer = creator,
        space = 8 + Message::INIT_SPACE,
        seeds = [
            b"message",
            conversation.key().as_ref(),
            &conversation.total_messages.to_le_bytes()
        ],
        bump
    )]
    pub message_account: Account<'info, Message>,

    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct CreatorProfile {
    pub creator: Pubkey,
    #[max_len(32)]
    pub name: String, // adding for creating creator's profile card.
    #[max_len(50)]
    pub bio: String, // adding for creating creator's profile card.
    #[max_len(100)]
    pub image: String, // adding for creating creator's profile card.
    #[max_len(64)]
    pub social_link: String, // adding for creating creator's profile card.
    pub category: Category,
    pub creator_token_mint: Pubkey,
    pub base_per_token: u64,    // base price in lamports
    pub chars_per_token: u64,   // how many chars = 1 token
    pub total_supply: u64,      // total tokens minted
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Conversation {
    pub user: Pubkey,
    pub creator: Pubkey,
    pub last_message_from: MessageSender,
    pub last_message_time: i64,
    pub total_messages: u64,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct Message {
    pub conversation: Pubkey,
    pub sender: Pubkey,
    #[max_len(500)]
    pub message_content: String,
    pub timestamp: i64,
    pub tokens_burned: u64,
    pub message_index: u64,
    pub sender_type: MessageSender,
    pub bump: u8,
}


#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum MessageSender {
    User,
    Creator,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum Category {
    TimeFunTeam,
    Founders,
    Influencers,
    Investors,
    Designer,
    Athletes,
    Solana,
    Musicians,
    Media,
    Companies,
    Other,
}

#[event]
pub struct MessageSent {
    pub conversation: Pubkey,
    pub sender: Pubkey,
    pub recipient: Pubkey,
    pub message: String,
    pub tokens_burned: u64,
    pub timestamp: i64,
}

// Error codes
#[error_code]
pub enum TimeFunError {
    #[msg("Insufficient word balance")]
    InsufficientWords,
    #[msg("Insufficient time balance")]
    InsufficientTime,
    #[msg("Insufficient token balance")]
    InsufficientTokens,
    #[msg("Session is not active")]
    SessionNotActive,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Arithmetic underflow")]
    Underflow,
    #[msg("MathError")]
    MathError,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Conversation not initialized")]
    ConversationNotInitialized,
    #[msg("Insufficient vault balance")]
    InsufficientVaultBalance,
}