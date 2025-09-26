/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/timefun.json`.
 */
export type Timefun = {
  "address": "4XpARVWj2XoKbXjdPoxSb4Ua54t5DzQPse9HDVMjvakE",
  "metadata": {
    "name": "timefun",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acceptTradeOffer",
      "discriminator": [
        47,
        111,
        224,
        26,
        202,
        213,
        193,
        205
      ],
      "accounts": [
        {
          "name": "tradeOffer",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "seller"
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "sellerTokenAccount",
          "writable": true
        },
        {
          "name": "buyerTimeTokenAccount",
          "writable": true
        },
        {
          "name": "sellerTimeTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "buyTime",
      "discriminator": [
        10,
        28,
        43,
        89,
        42,
        103,
        15,
        201
      ],
      "accounts": [
        {
          "name": "creatorProfile",
          "writable": true
        },
        {
          "name": "timeTokenMint",
          "writable": true
        },
        {
          "name": "buyer",
          "writable": true,
          "signer": true
        },
        {
          "name": "buyerTokenAccount",
          "writable": true
        },
        {
          "name": "buyerTimeTokenAccount",
          "writable": true
        },
        {
          "name": "creatorTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "cancelTradeOffer",
      "discriminator": [
        217,
        46,
        97,
        98,
        211,
        188,
        43,
        171
      ],
      "accounts": [
        {
          "name": "tradeOffer",
          "writable": true
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "createCreatorProfile",
      "discriminator": [
        139,
        244,
        127,
        145,
        95,
        172,
        140,
        154
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "platform",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "creatorProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114,
                  95,
                  112,
                  114,
                  111,
                  102,
                  105,
                  108,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "timeTokenMint",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "creatorName",
          "type": "string"
        },
        {
          "name": "pricePerMinute",
          "type": "u64"
        },
        {
          "name": "maxSupply",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTradeOffer",
      "discriminator": [
        240,
        221,
        182,
        51,
        162,
        212,
        114,
        220
      ],
      "accounts": [
        {
          "name": "tradeOffer",
          "writable": true,
          "signer": true
        },
        {
          "name": "creatorProfile"
        },
        {
          "name": "seller",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amountOffered",
          "type": "u64"
        },
        {
          "name": "pricePerToken",
          "type": "u64"
        },
        {
          "name": "expiresAt",
          "type": "i64"
        }
      ]
    },
    {
      "name": "initializePlatform",
      "discriminator": [
        119,
        201,
        101,
        45,
        75,
        122,
        89,
        3
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "platform",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  116,
                  102,
                  111,
                  114,
                  109
                ]
              }
            ]
          }
        },
        {
          "name": "treasury"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "platformFeeBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "redeemTime",
      "discriminator": [
        190,
        189,
        60,
        65,
        86,
        143,
        182,
        102
      ],
      "accounts": [
        {
          "name": "creatorProfile",
          "writable": true
        },
        {
          "name": "timeTokenMint",
          "writable": true
        },
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "userTimeTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "sessionType",
          "type": {
            "defined": {
              "name": "sessionType"
            }
          }
        }
      ]
    },
    {
      "name": "updateCreatorStatus",
      "discriminator": [
        57,
        220,
        131,
        57,
        69,
        104,
        132,
        230
      ],
      "accounts": [
        {
          "name": "creatorProfile",
          "writable": true
        },
        {
          "name": "creator",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "isActive",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "creatorProfile",
      "discriminator": [
        251,
        250,
        184,
        111,
        214,
        178,
        32,
        221
      ]
    },
    {
      "name": "platform",
      "discriminator": [
        77,
        92,
        204,
        58,
        187,
        98,
        91,
        12
      ]
    },
    {
      "name": "tradeOffer",
      "discriminator": [
        240,
        30,
        82,
        234,
        214,
        166,
        118,
        200
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "nameTooLong",
      "msg": "Creator name is too long"
    },
    {
      "code": 6001,
      "name": "creatorInactive",
      "msg": "Creator is not active"
    },
    {
      "code": 6002,
      "name": "exceedsMaxSupply",
      "msg": "Exceeds maximum supply"
    },
    {
      "code": 6003,
      "name": "tradeOfferInactive",
      "msg": "Trade offer is not active"
    },
    {
      "code": 6004,
      "name": "tradeOfferExpired",
      "msg": "Trade offer has expired"
    },
    {
      "code": 6005,
      "name": "invalidAmount",
      "msg": "Invalid amount - must be greater than 0"
    },
    {
      "code": 6006,
      "name": "invalidPrice",
      "msg": "Invalid price - must be greater than 0"
    },
    {
      "code": 6007,
      "name": "invalidSupply",
      "msg": "Invalid supply - must be greater than 0"
    },
    {
      "code": 6008,
      "name": "invalidFee",
      "msg": "Invalid fee - cannot exceed 10%"
    },
    {
      "code": 6009,
      "name": "invalidExpiry",
      "msg": "Invalid expiry time"
    },
    {
      "code": 6010,
      "name": "unauthorized",
      "msg": "unauthorized"
    },
    {
      "code": 6011,
      "name": "mathOverflow",
      "msg": "Math overflow"
    }
  ],
  "types": [
    {
      "name": "creatorProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "timeTokenMint",
            "type": "pubkey"
          },
          {
            "name": "pricePerMinute",
            "type": "u64"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "maxSupply",
            "type": "u64"
          },
          {
            "name": "totalEarned",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "platform",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "treasury",
            "type": "pubkey"
          },
          {
            "name": "platformFeeBps",
            "type": "u16"
          },
          {
            "name": "treasuryBump",
            "type": "u8"
          },
          {
            "name": "totalCreators",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "sessionType",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "directMessage"
          },
          {
            "name": "voiceCall"
          },
          {
            "name": "videoCall"
          }
        ]
      }
    },
    {
      "name": "tradeOffer",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "seller",
            "type": "pubkey"
          },
          {
            "name": "creatorProfile",
            "type": "pubkey"
          },
          {
            "name": "amountOffered",
            "type": "u64"
          },
          {
            "name": "pricePerToken",
            "type": "u64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
