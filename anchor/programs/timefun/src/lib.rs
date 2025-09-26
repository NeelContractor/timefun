#![allow(clippy::result_large_err)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};

declare_id!("4XpARVWj2XoKbXjdPoxSb4Ua54t5DzQPse9HDVMjvakE");

#[program]
pub mod timefun {
    use super::*;

    pub fn initialize_platform(ctx: Context<InitializePlatform>, platform_fee_bps: u16) -> Result<()> {
        let platform = &mut ctx.accounts.platform;
        platform.authority = ctx.accounts.authority.key();
        platform.treasury = ctx.accounts.treasury.key();
        platform.platform_fee_bps = platform_fee_bps;
        platform.treasury_bump = ctx.bumps.platform;
        platform.total_creators = 0;
        Ok(())
    }

    pub fn create_creator_profile(ctx: Context<CreateCreatorProfile>, creator_name: String, price_per_minute: u64, max_supply: u64) -> Result<()> {
        require!(creator_name.len() <= 32, TimeFunError::NameTooLong);

        let creator_profile = &mut ctx.accounts.creator_profile;
        creator_profile.creator = ctx.accounts.creator.key();
        creator_profile.name = creator_name;
        creator_profile.time_token_mint = ctx.accounts.time_token_mint.key();
        creator_profile.price_per_minute = price_per_minute;
        creator_profile.total_supply = 0;
        creator_profile.max_supply = max_supply;
        creator_profile.total_earned = 0;
        creator_profile.is_active = true;
        creator_profile.bump = ctx.bumps.creator_profile;

        let platform = &mut ctx.accounts.platform;
        platform.total_creators += 1;
        Ok(())
    }

    pub fn buy_time(ctx: Context<BuyTime>, amount: u64) -> Result<()> {
        let creator_profile = &mut ctx.accounts.creator_profile;
        require!(creator_profile.is_active, TimeFunError::CreatorInactive);
        require!(creator_profile.total_supply + amount <= creator_profile.max_supply, TimeFunError::ExceedsMaxSupply);

        let total_cost = calculate_bonding_curve_cost(creator_profile.total_supply, amount, creator_profile.price_per_minute);

        let platform_fee = (total_cost * ctx.accounts.platform.platform_fee_bps as u64) / 10000;
        let creator_revenue = total_cost - platform_fee;

        let transfer_to_creator = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.creator_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info()
        };
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(), 
                transfer_to_creator,
            ),
            creator_revenue,
        )?;

        let transfer_to_treasury = Transfer { 
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.treasury_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info()
        };
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_to_treasury,
            ),
            platform_fee
        )?;

        let binding = creator_profile.creator.key();
        let seeds = &[
            b"creator_profile",
            binding.as_ref(),
            &[creator_profile.bump]
        ];
        let signer_seeds = &[&seeds[..]];

        let mint_to_buyer = token::MintTo {
            mint: ctx.accounts.time_token_mint.to_account_info(),
            to: ctx.accounts.buyer_time_token_account.to_account_info(),
            authority: creator_profile.to_account_info()
        };
        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(), 
                mint_to_buyer,
                signer_seeds
            ),
            amount
        )?;

        creator_profile.total_supply += amount;
        creator_profile.total_earned += creator_revenue;
        Ok(())
    }

    pub fn redeem_time(ctx: Context<RedeemTime>, amount: u64, _session_type: SessionType) -> Result<()> {
        let creator_profile = &mut ctx.accounts.creator_profile;
        require!(creator_profile.is_active, TimeFunError::CreatorInactive);

        let burn_tokens = token::Burn {
            mint: ctx.accounts.time_token_mint.to_account_info(),
            from: ctx.accounts.user_time_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info()
        };
        token::burn(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                burn_tokens
            ),
            amount
        )?;
        creator_profile.total_supply -= amount;
        Ok(())
    }

    pub fn create_trade_offer(ctx: Context<CreateTradeOffer>, amount_offered: u64, price_per_token: u64, expires_at: i64) -> Result<()> {
        let trade_offer = &mut ctx.accounts.trade_offer;
        trade_offer.seller = ctx.accounts.seller.key();
        trade_offer.creator_profile = ctx.accounts.creator_profile.key();
        trade_offer.amount_offered = amount_offered;
        trade_offer.price_per_token = price_per_token;
        trade_offer.expires_at = expires_at;
        trade_offer.is_active = true;
        Ok(())
    }

    pub fn accept_trade_offer(ctx: Context<AcceptTradeOffer>) -> Result<()> {
        let trade_offer = &mut ctx.accounts.trade_offer;
        require!(trade_offer.is_active, TimeFunError::TradeOfferInactive);
        require!(Clock::get()?.unix_timestamp < trade_offer.expires_at, TimeFunError::TradeOfferExpired);

        let total_cost = trade_offer.amount_offered * trade_offer.price_per_token;

        let transfer_payment = Transfer {
            from: ctx.accounts.buyer_token_account.to_account_info(),
            to: ctx.accounts.seller_token_account.to_account_info(),
            authority: ctx.accounts.buyer.to_account_info(),
        };

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_payment,
            ),
            total_cost,
        )?;

        // Transfer time tokens from seller to buyer
        let transfer_time_tokens = Transfer {
            from: ctx.accounts.seller_time_token_account.to_account_info(),
            to: ctx.accounts.buyer_time_token_account.to_account_info(),
            authority: ctx.accounts.seller.to_account_info(),
        };
        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                transfer_time_tokens,
            ),
            trade_offer.amount_offered,
        )?;

        trade_offer.is_active = false;

        Ok(())
    }

    pub fn cancel_trade_offer(ctx: Context<CancelTradeOffer>) -> Result<()> {
        let trade_offer = &mut ctx.accounts.trade_offer;
        require!(trade_offer.is_active, TimeFunError::TradeOfferInactive);
        require!(trade_offer.seller == ctx.accounts.seller.key(), TimeFunError::Unauthorized);
        
        trade_offer.is_active = false;
        
        Ok(())
    }

    pub fn update_creator_status(ctx: Context<UpdateCreatorStatus>, is_active: bool) -> Result<()> {
        let creator_profile = &mut ctx.accounts.creator_profile;
        require!(creator_profile.creator == ctx.accounts.creator.key(), TimeFunError::Unauthorized);
        
        creator_profile.is_active = is_active;
        
        Ok(())
    }
}

fn calculate_bonding_curve_cost(current_supply: u64, amount: u64, base_price: u64) -> u64 {
    let mut total_cost = 0u64;

    for i in 0..amount {
        let current_token = current_supply + i;
        let token_price = base_price + (base_price * current_token) / 1000;
        total_cost += token_price;
    }

    total_cost
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Platform::INIT_SPACE,
        seeds = [b"platform"],
        bump
    )]
    pub platform: Account<'info, Platform>,

    /// CHECK: Treasury account
    pub treasury: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateCreatorProfile<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,

    #[account(
        seeds = [b"platform"],
        bump = platform.treasury_bump
    )]
    pub platform: Account<'info, Platform>,

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
        mint::decimals = 0,
        mint::authority = creator_profile,
    )]
    pub time_token_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct BuyTime<'info> {
    #[account(mut)]
    pub creator_profile: Account<'info, CreatorProfile>,

    #[account(mut)]
    pub time_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub buyer: Signer<'info>,

    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub buyer_time_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub creator_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub treasury_token_account: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"platform"],
        bump = platform.treasury_bump
    )]
    pub platform: Account<'info, Platform>,
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct RedeemTime<'info> {
    #[account(mut)]
    pub creator_profile: Account<'info, CreatorProfile>,

    #[account(mut)]
    pub time_token_mint: Account<'info, Mint>,

    #[account(mut)]
    pub user: Signer<'info>,

    #[account(mut)]
    pub user_time_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}


#[derive(Accounts)]
pub struct CreateTradeOffer<'info> {
    #[account(
        init,
        payer = seller,
        space = TradeOffer::INIT_SPACE,
    )]
    pub trade_offer: Account<'info, TradeOffer>,
    
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AcceptTradeOffer<'info> {
    #[account(mut)]
    pub trade_offer: Account<'info, TradeOffer>,
    
    #[account(mut)]
    pub buyer: Signer<'info>,
    
    /// CHECK: Seller account
    pub seller: AccountInfo<'info>,
    
    #[account(mut)]
    pub buyer_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub seller_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub buyer_time_token_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub seller_time_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct CancelTradeOffer<'info> {
    #[account(mut)]
    pub trade_offer: Account<'info, TradeOffer>,
    
    #[account(mut)]
    pub seller: Signer<'info>,
}

#[derive(Accounts)]
pub struct UpdateCreatorStatus<'info> {
    #[account(mut)]
    pub creator_profile: Account<'info, CreatorProfile>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
}

#[account]
#[derive(InitSpace)]
pub struct Platform {
    pub authority: Pubkey,
    pub treasury: Pubkey,
    pub platform_fee_bps: u16,
    pub treasury_bump: u8,
    pub total_creators: u64,
}

#[account]
#[derive(InitSpace)]
pub struct CreatorProfile {
    pub creator: Pubkey,
    #[max_len(32)]
    pub name: String,
    pub time_token_mint: Pubkey,
    pub price_per_minute: u64,
    pub total_supply: u64,
    pub max_supply: u64,
    pub total_earned: u64,
    pub is_active: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct TradeOffer {
    pub seller: Pubkey,
    pub creator_profile: Pubkey,
    pub amount_offered: u64,
    pub price_per_token: u64,
    pub expires_at: i64,
    pub is_active: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy)]
pub enum SessionType {
    DirectMessage,
    VoiceCall,
    VideoCall
}

#[error_code]
pub enum TimeFunError {
    #[msg("Creator name is too long")]
    NameTooLong,
    #[msg("Creator is not active")]
    CreatorInactive,
    #[msg("Exceeds maximum supply")]
    ExceedsMaxSupply,
    #[msg("Trade offer is not active")]
    TradeOfferInactive,
    #[msg("Trade offer has expired")]
    TradeOfferExpired,
    #[msg("Invalid amount - must be greater than 0")]
    InvalidAmount,
    #[msg("Invalid price - must be greater than 0")]
    InvalidPrice,
    #[msg("Invalid supply - must be greater than 0")]
    InvalidSupply,
    #[msg("Invalid fee - cannot exceed 10%")]
    InvalidFee,
    #[msg("Invalid expiry time")]
    InvalidExpiry,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Math overflow")]
    MathOverflow,
}