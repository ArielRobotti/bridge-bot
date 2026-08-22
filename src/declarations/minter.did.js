export const idlFactory = ({ IDL }) => {
  const CandyShared = IDL.Rec();
  const Value__1 = IDL.Rec();
  const Value__3 = IDL.Rec();
  const TransferError__1 = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TemporarilyUnavailable' : IDL.Null,
    'BadBurn' : IDL.Record({ 'min_burn_amount' : IDL.Nat }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'BadFee' : IDL.Record({ 'expected_fee' : IDL.Nat }),
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'TooOld' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : IDL.Nat }),
  });
  const Result_2 = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : TransferError__1 });
  const ListingId = IDL.Int;
  const ListingStatus = IDL.Variant({
    'active' : IDL.Null,
    'cancelled' : IDL.Null,
    'sold' : IDL.Record({ 'to' : IDL.Principal, 'date' : IDL.Int }),
    'wonByBid' : IDL.Record({
      'date' : IDL.Int,
      'winner' : IDL.Principal,
      'amount' : IDL.Nat,
    }),
    'endedNoBids' : IDL.Record({ 'date' : IDL.Int }),
  });
  const TokenId = IDL.Nat;
  const Bid = IDL.Record({
    'timestamp' : IDL.Int,
    'amount' : IDL.Nat,
    'bidder' : IDL.Principal,
  });
  const ListingKindPublic = IDL.Variant({
    'sale' : IDL.Record({ 'priceNXT' : IDL.Nat }),
    'auction' : IDL.Record({
      'endDate' : IDL.Int,
      'reservePriceNXT' : IDL.Opt(IDL.Nat),
      'highestBid' : IDL.Opt(Bid),
      'bidHistory' : IDL.Vec(Bid),
      'startPriceNXT' : IDL.Nat,
    }),
  });
  const ListingPublic = IDL.Record({
    'id' : ListingId,
    'status' : ListingStatus,
    'tokenId' : TokenId,
    'kind' : ListingKindPublic,
    'seller' : IDL.Principal,
  });
  const ListingResult = IDL.Variant({ 'Ok' : ListingPublic, 'Err' : IDL.Text });
  const Key = IDL.Text;
  const Value__2 = IDL.Variant({
    'Nat' : IDL.Nat,
    'BoolArray' : IDL.Vec(IDL.Bool),
    'Blob' : IDL.Vec(IDL.Nat8),
    'Bool' : IDL.Bool,
    'Text' : IDL.Text,
    'NatArray' : IDL.Vec(IDL.Nat),
    'TextArray' : IDL.Vec(IDL.Text),
    'BlobArray' : IDL.Vec(IDL.Vec(IDL.Nat8)),
    'Principal' : IDL.Principal,
    'PrincipalArray' : IDL.Vec(IDL.Principal),
  });
  const MetadataArray = IDL.Vec(IDL.Tuple(Key, Value__2));
  const UserEditableData = IDL.Record({
    'name' : IDL.Text,
    'extraData' : MetadataArray,
  });
  const User = IDL.Record({
    'principal' : IDL.Principal,
    'fortniteID' : IDL.Opt(IDL.Text),
    'name' : IDL.Opt(IDL.Text),
    'email' : IDL.Opt(IDL.Text),
    'extraData' : MetadataArray,
    'fortniteUserName' : IDL.Opt(IDL.Text),
    'registrationDate' : IDL.Int,
    'assignedAccountID' : IDL.Vec(IDL.Nat8),
    'avatar' : IDL.Opt(IDL.Vec(IDL.Nat8)),
  });
  const PropertyShared = IDL.Record({
    'value' : CandyShared,
    'name' : IDL.Text,
    'immutable' : IDL.Bool,
  });
  CandyShared.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, CandyShared)),
      'Nat' : IDL.Nat,
      'Set' : IDL.Vec(CandyShared),
      'Nat16' : IDL.Nat16,
      'Nat32' : IDL.Nat32,
      'Nat64' : IDL.Nat64,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Bool' : IDL.Bool,
      'Int8' : IDL.Int8,
      'Ints' : IDL.Vec(IDL.Int),
      'Nat8' : IDL.Nat8,
      'Nats' : IDL.Vec(IDL.Nat),
      'Text' : IDL.Text,
      'Bytes' : IDL.Vec(IDL.Nat8),
      'Int16' : IDL.Int16,
      'Int32' : IDL.Int32,
      'Int64' : IDL.Int64,
      'Option' : IDL.Opt(CandyShared),
      'Floats' : IDL.Vec(IDL.Float64),
      'Float' : IDL.Float64,
      'Principal' : IDL.Principal,
      'Array' : IDL.Vec(CandyShared),
      'ValueMap' : IDL.Vec(IDL.Tuple(CandyShared, CandyShared)),
      'Class' : IDL.Vec(PropertyShared),
    })
  );
  const AssetCoupon = IDL.Record({
    'id' : IDL.Nat64,
    'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, CandyShared)),
    'expender' : IDL.Principal,
    'createdAt' : IDL.Int,
    'claimed' : IDL.Opt(
      IDL.Record({
        'tokenId' : IDL.Nat,
        'date' : IDL.Int,
        'claimer' : IDL.Principal,
        'blockIndex' : IDL.Nat,
      })
    ),
    'redeem' : IDL.Opt(
      IDL.Record({
        'date' : IDL.Int,
        'redeemer' : IDL.Principal,
        'blockIndex' : IDL.Nat,
      })
    ),
  });
  const NXTCoupon = IDL.Record({
    'id' : IDL.Nat64,
    'value' : IDL.Nat,
    'createdAt' : IDL.Int,
    'claimed' : IDL.Opt(
      IDL.Record({
        'date' : IDL.Int,
        'claimer' : IDL.Principal,
        'blockIndex' : IDL.Nat,
      })
    ),
  });
  const UserInfo = IDL.Record({
    'sub' : IDL.Text,
    'familyName' : IDL.Text,
    'emailVerified' : IDL.Bool,
    'name' : IDL.Text,
    'givenName' : IDL.Text,
    'email' : IDL.Text,
    'picture' : IDL.Text,
  });
  const Map = IDL.Vec(IDL.Tuple(IDL.Text, Value__3));
  Value__3.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : Map,
      'Nat' : IDL.Nat,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Text' : IDL.Text,
      'Array' : IDL.Vec(Value__3),
    })
  );
  const Metadata = IDL.Vec(IDL.Tuple(IDL.Text, Value__3));
  const ExternalIdentity = IDL.Record({
    'userInfo' : UserInfo,
    'provider' : IDL.Text,
    'data' : Metadata,
  });
  const RankingsTop20 = IDL.Record({
    'allTimes' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'lastMonth' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'last24Hs' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
    'lastWeek' : IDL.Vec(IDL.Tuple(IDL.Principal, IDL.Nat)),
  });
  const TransferError = IDL.Variant({
    'GenericError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'Duplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat }),
    'NonExistingTokenId' : IDL.Null,
    'Unauthorized' : IDL.Null,
    'CreatedInFuture' : IDL.Record({ 'ledger_time' : IDL.Nat64 }),
    'InvalidRecipient' : IDL.Null,
    'GenericBatchError' : IDL.Record({
      'message' : IDL.Text,
      'error_code' : IDL.Nat,
    }),
    'TooOld' : IDL.Null,
  });
  const TransferResult = IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : TransferError });
  const Tokens = IDL.Record({ 'e8s' : IDL.Nat64 });
  const TransferError_1 = IDL.Variant({
    'TxTooOld' : IDL.Record({ 'allowed_window_nanos' : IDL.Nat64 }),
    'BadFee' : IDL.Record({ 'expected_fee' : Tokens }),
    'TxDuplicate' : IDL.Record({ 'duplicate_of' : IDL.Nat64 }),
    'TxCreatedInFuture' : IDL.Null,
    'InsufficientFunds' : IDL.Record({ 'balance' : Tokens }),
  });
  const Result_6 = IDL.Variant({ 'Ok' : IDL.Nat64, 'Err' : TransferError_1 });
  const HttpHeader = IDL.Record({ 'value' : IDL.Text, 'name' : IDL.Text });
  const HttpRequestResult = IDL.Record({
    'status' : IDL.Nat,
    'body' : IDL.Vec(IDL.Nat8),
    'headers' : IDL.Vec(HttpHeader),
  });
  const TransformArg = IDL.Record({
    'context' : IDL.Vec(IDL.Nat8),
    'response' : HttpRequestResult,
  });
  Value__1.fill(
    IDL.Variant({
      'Int' : IDL.Int,
      'Map' : IDL.Vec(IDL.Tuple(IDL.Text, Value__1)),
      'Nat' : IDL.Nat,
      'Blob' : IDL.Vec(IDL.Nat8),
      'Text' : IDL.Text,
      'Array' : IDL.Vec(Value__1),
    })
  );
  const _anon_class_28_1 = IDL.Service({
    'addAdmin' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'addBrand' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'areListed' : IDL.Func([IDL.Vec(IDL.Nat)], [IDL.Vec(IDL.Bool)], ['query']),
    'balance' : IDL.Func([], [IDL.Nat], ['composite_query']),
    'bridgeBurnNXTFrom' : IDL.Func(
        [IDL.Record({ 'from' : IDL.Principal, 'amount' : IDL.Nat })],
        [Result_2],
        [],
      ),
    'bridgeMintNXT' : IDL.Func(
        [IDL.Record({ 'to' : IDL.Principal, 'amount' : IDL.Nat })],
        [Result_2],
        [],
      ),
    'bridgeTransferNXT' : IDL.Func(
        [
          IDL.Record({
            'to' : IDL.Principal,
            'from' : IDL.Principal,
            'amount' : IDL.Nat,
          }),
        ],
        [Result_2],
        [],
      ),
    'burnFees' : IDL.Func(
        [],
        [IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : TransferError__1 })],
        [],
      ),
    'createAuctionListing' : IDL.Func(
        [
          IDL.Record({
            'tokenId' : IDL.Nat,
            'endDate' : IDL.Int,
            'reservePriceNXT' : IDL.Opt(IDL.Nat),
            'startPriceNXT' : IDL.Nat,
          }),
        ],
        [ListingResult],
        [],
      ),
    'createSaleListing' : IDL.Func(
        [IDL.Record({ 'tokenId' : IDL.Nat, 'priceNXT' : IDL.Nat })],
        [ListingResult],
        [],
      ),
    'editProfile' : IDL.Func(
        [UserEditableData],
        [IDL.Variant({ 'Ok' : User, 'Err' : IDL.Text })],
        [],
      ),
    'fetchSelectedUsers' : IDL.Func(
        [IDL.Vec(IDL.Principal)],
        [IDL.Vec(IDL.Opt(User))],
        ['query'],
      ),
    'generateAssetCoupon' : IDL.Func(
        [
          IDL.Record({
            'qty' : IDL.Nat,
            'metadata' : IDL.Vec(IDL.Tuple(IDL.Text, CandyShared)),
            'expender' : IDL.Principal,
            'image' : IDL.Vec(IDL.Nat8),
          }),
        ],
        [IDL.Vec(IDL.Nat)],
        [],
      ),
    'generateCoupons' : IDL.Func(
        [IDL.Record({ 'qty' : IDL.Nat, 'value' : IDL.Nat })],
        [IDL.Vec(IDL.Nat)],
        [],
      ),
    'getAdmins' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getAsset' : IDL.Func([IDL.Nat], [IDL.Opt(IDL.Vec(IDL.Nat8))], ['query']),
    'getAssetsCoupons' : IDL.Func([], [IDL.Vec(AssetCoupon)], []),
    'getBrands' : IDL.Func([], [IDL.Vec(User)], ['query']),
    'getClaimedAssetsCoupons' : IDL.Func([], [IDL.Vec(AssetCoupon)], []),
    'getCollectedFees' : IDL.Func([], [IDL.Nat], ['composite_query']),
    'getCouponsInfo' : IDL.Func([], [IDL.Vec(NXTCoupon)], ['query']),
    'getDiscordUser' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : User, 'Err' : IDL.Text })],
        ['query'],
      ),
    'getExternalsByPrincipal' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(ExternalIdentity)],
        ['query'],
      ),
    'getLinkedAccounts' : IDL.Func([], [IDL.Vec(ExternalIdentity)], ['query']),
    'getListingIdForTokens' : IDL.Func(
        [IDL.Vec(IDL.Nat)],
        [IDL.Vec(IDL.Opt(IDL.Int))],
        ['query'],
      ),
    'getListings' : IDL.Func([], [IDL.Vec(ListingPublic)], ['query']),
    'getOauthRewards' : IDL.Func(
        [],
        [IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat))],
        ['query'],
      ),
    'getProviderSecret' : IDL.Func([IDL.Text], [IDL.Opt(IDL.Text)], ['query']),
    'getRankings' : IDL.Func([], [RankingsTop20], []),
    'getSubaccount' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'getUserName' : IDL.Func(
        [IDL.Text],
        [IDL.Variant({ 'Ok' : IDL.Text, 'Err' : IDL.Null })],
        ['query'],
      ),
    'getUserSubaccount' : IDL.Func(
        [IDL.Principal],
        [IDL.Vec(IDL.Nat8)],
        ['query'],
      ),
    'getUsers' : IDL.Func(
        [IDL.Record({ 'page' : IDL.Int, 'pageSize' : IDL.Opt(IDL.Int) })],
        [IDL.Record({ 'hasMore' : IDL.Bool, 'items' : IDL.Vec(User) })],
        ['query'],
      ),
    'icpAccountId' : IDL.Func([], [IDL.Vec(IDL.Nat8)], ['query']),
    'imAdmin' : IDL.Func([], [IDL.Bool], []),
    'linkOAuth' : IDL.Func(
        [
          IDL.Record({
            'provider' : IDL.Text,
            'code' : IDL.Text,
            'codeVerifier' : IDL.Opt(IDL.Text),
          }),
        ],
        [
          IDL.Variant({
            'Ok' : IDL.Record({
              'userInfo' : UserInfo,
              'user' : IDL.Opt(User),
            }),
            'Err' : IDL.Text,
          }),
        ],
        [],
      ),
    'loadAvatar' : IDL.Func(
        [IDL.Opt(IDL.Vec(IDL.Nat8))],
        [IDL.Variant({ 'Ok' : User, 'Err' : IDL.Text })],
        [],
      ),
    'login' : IDL.Func([], [IDL.Opt(User)], ['query']),
    'redeemRWA' : IDL.Func(
        [IDL.Nat, IDL.Text],
        [IDL.Vec(IDL.Opt(TransferResult))],
        [],
      ),
    'redeem_coupon' : IDL.Func(
        [IDL.Nat64],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'removeAdmin' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'removeBrand' : IDL.Func(
        [IDL.Principal],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Text })],
        [],
      ),
    'removeUser' : IDL.Func([IDL.Principal], [IDL.Opt(User)], []),
    'sendNXST' : IDL.Func(
        [IDL.Record({ 'to' : IDL.Text, 'amount' : IDL.Nat })],
        [Result_2],
        [],
      ),
    'signUp' : IDL.Func(
        [IDL.Text, IDL.Opt(IDL.Principal)],
        [IDL.Variant({ 'Ok' : User, 'Err' : IDL.Text })],
        [],
      ),
    'tokensOf' : IDL.Func([], [IDL.Vec(IDL.Nat)], ['composite_query']),
    'transferFrom' : IDL.Func(
        [
          IDL.Record({
            'to' : IDL.Vec(IDL.Nat8),
            'from' : IDL.Principal,
            'amount' : IDL.Nat64,
          }),
        ],
        [Result_6],
        [],
      ),
    'transferRWA' : IDL.Func(
        [IDL.Record({ 'token_id' : IDL.Nat, 'toPrincipal' : IDL.Principal })],
        [IDL.Vec(IDL.Opt(TransferResult))],
        [],
      ),
    'transform' : IDL.Func([TransformArg], [HttpRequestResult], ['query']),
    'updateConfig' : IDL.Func(
        [IDL.Vec(IDL.Tuple(IDL.Text, Value__1))],
        [IDL.Variant({ 'Ok' : IDL.Null, 'Err' : IDL.Null })],
        [],
      ),
    'withdraw' : IDL.Func(
        [
          IDL.Record({
            'to' : IDL.Text,
            'subaccount' : IDL.Opt(IDL.Vec(IDL.Nat8)),
            'amount' : IDL.Nat,
          }),
        ],
        [IDL.Variant({ 'Ok' : IDL.Nat, 'Err' : IDL.Text })],
        [],
      ),
  });
  return _anon_class_28_1;
};
export const init = ({ IDL }) => { return []; };

