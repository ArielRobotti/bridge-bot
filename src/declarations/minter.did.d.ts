import type { Principal } from '@icp-sdk/core/principal';
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface AssetCoupon {
  'id' : bigint,
  'metadata' : Array<[string, CandyShared]>,
  'expender' : Principal,
  'createdAt' : bigint,
  'claimed' : [] | [
    {
      'tokenId' : bigint,
      'date' : bigint,
      'claimer' : Principal,
      'blockIndex' : bigint,
    }
  ],
  'redeem' : [] | [
    { 'date' : bigint, 'redeemer' : Principal, 'blockIndex' : bigint }
  ],
}
export interface Bid {
  'timestamp' : bigint,
  'amount' : bigint,
  'bidder' : Principal,
}
export type CandyShared = { 'Int' : bigint } |
  { 'Map' : Array<[string, CandyShared]> } |
  { 'Nat' : bigint } |
  { 'Set' : Array<CandyShared> } |
  { 'Nat16' : number } |
  { 'Nat32' : number } |
  { 'Nat64' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Bool' : boolean } |
  { 'Int8' : number } |
  { 'Ints' : Array<bigint> } |
  { 'Nat8' : number } |
  { 'Nats' : Array<bigint> } |
  { 'Text' : string } |
  { 'Bytes' : Uint8Array | number[] } |
  { 'Int16' : number } |
  { 'Int32' : number } |
  { 'Int64' : bigint } |
  { 'Option' : [] | [CandyShared] } |
  { 'Floats' : Array<number> } |
  { 'Float' : number } |
  { 'Principal' : Principal } |
  { 'Array' : Array<CandyShared> } |
  { 'ValueMap' : Array<[CandyShared, CandyShared]> } |
  { 'Class' : Array<PropertyShared> };
export interface ExternalIdentity {
  'userInfo' : UserInfo,
  'provider' : string,
  'data' : Metadata,
}
export interface HttpHeader { 'value' : string, 'name' : string }
export interface HttpRequestResult {
  'status' : bigint,
  'body' : Uint8Array | number[],
  'headers' : Array<HttpHeader>,
}
export type Key = string;
export type ListingId = bigint;
export type ListingKindPublic = { 'sale' : { 'priceNXT' : bigint } } |
  {
    'auction' : {
      'endDate' : bigint,
      'reservePriceNXT' : [] | [bigint],
      'highestBid' : [] | [Bid],
      'bidHistory' : Array<Bid>,
      'startPriceNXT' : bigint,
    }
  };
export interface ListingPublic {
  'id' : ListingId,
  'status' : ListingStatus,
  'tokenId' : TokenId,
  'kind' : ListingKindPublic,
  'seller' : Principal,
}
export type ListingResult = { 'Ok' : ListingPublic } |
  { 'Err' : string };
export type ListingStatus = { 'active' : null } |
  { 'cancelled' : null } |
  { 'sold' : { 'to' : Principal, 'date' : bigint } } |
  {
    'wonByBid' : { 'date' : bigint, 'winner' : Principal, 'amount' : bigint }
  } |
  { 'endedNoBids' : { 'date' : bigint } };
export type Map = Array<[string, Value__3]>;
export type Metadata = Array<[string, Value__3]>;
export type MetadataArray = Array<[Key, Value__2]>;
export interface NXTCoupon {
  'id' : bigint,
  'value' : bigint,
  'createdAt' : bigint,
  'claimed' : [] | [
    { 'date' : bigint, 'claimer' : Principal, 'blockIndex' : bigint }
  ],
}
export interface PropertyShared {
  'value' : CandyShared,
  'name' : string,
  'immutable' : boolean,
}
export interface RankingsTop20 {
  'allTimes' : Array<[Principal, bigint]>,
  'lastMonth' : Array<[Principal, bigint]>,
  'last24Hs' : Array<[Principal, bigint]>,
  'lastWeek' : Array<[Principal, bigint]>,
}
export type Result_2 = { 'Ok' : bigint } |
  { 'Err' : TransferError__1 };
export type Result_6 = { 'Ok' : bigint } |
  { 'Err' : TransferError_1 };
export type TokenId = bigint;
export interface Tokens { 'e8s' : bigint }
export type TransferError = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'NonExistingTokenId' : null } |
  { 'Unauthorized' : null } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'InvalidRecipient' : null } |
  { 'GenericBatchError' : { 'message' : string, 'error_code' : bigint } } |
  { 'TooOld' : null };
export type TransferError_1 = {
    'TxTooOld' : { 'allowed_window_nanos' : bigint }
  } |
  { 'BadFee' : { 'expected_fee' : Tokens } } |
  { 'TxDuplicate' : { 'duplicate_of' : bigint } } |
  { 'TxCreatedInFuture' : null } |
  { 'InsufficientFunds' : { 'balance' : Tokens } };
export type TransferError__1 = {
    'GenericError' : { 'message' : string, 'error_code' : bigint }
  } |
  { 'TemporarilyUnavailable' : null } |
  { 'BadBurn' : { 'min_burn_amount' : bigint } } |
  { 'Duplicate' : { 'duplicate_of' : bigint } } |
  { 'BadFee' : { 'expected_fee' : bigint } } |
  { 'CreatedInFuture' : { 'ledger_time' : bigint } } |
  { 'TooOld' : null } |
  { 'InsufficientFunds' : { 'balance' : bigint } };
export type TransferResult = { 'Ok' : bigint } |
  { 'Err' : TransferError };
export interface TransformArg {
  'context' : Uint8Array | number[],
  'response' : HttpRequestResult,
}
export interface User {
  'principal' : Principal,
  'fortniteID' : [] | [string],
  'name' : [] | [string],
  'email' : [] | [string],
  'extraData' : MetadataArray,
  'fortniteUserName' : [] | [string],
  'registrationDate' : bigint,
  'assignedAccountID' : Uint8Array | number[],
  'avatar' : [] | [Uint8Array | number[]],
}
export interface UserEditableData {
  'name' : string,
  'extraData' : MetadataArray,
}
export interface UserInfo {
  'sub' : string,
  'familyName' : string,
  'emailVerified' : boolean,
  'name' : string,
  'givenName' : string,
  'email' : string,
  'picture' : string,
}
export type Value__1 = { 'Int' : bigint } |
  { 'Map' : Array<[string, Value__1]> } |
  { 'Nat' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Text' : string } |
  { 'Array' : Array<Value__1> };
export type Value__2 = { 'Nat' : bigint } |
  { 'BoolArray' : Array<boolean> } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Bool' : boolean } |
  { 'Text' : string } |
  { 'NatArray' : Array<bigint> } |
  { 'TextArray' : Array<string> } |
  { 'BlobArray' : Array<Uint8Array | number[]> } |
  { 'Principal' : Principal } |
  { 'PrincipalArray' : Array<Principal> };
export type Value__3 = { 'Int' : bigint } |
  { 'Map' : Map } |
  { 'Nat' : bigint } |
  { 'Blob' : Uint8Array | number[] } |
  { 'Text' : string } |
  { 'Array' : Array<Value__3> };
export interface _anon_class_28_1 {
  'addAdmin' : ActorMethod<[Principal], { 'Ok' : null } | { 'Err' : string }>,
  'addBrand' : ActorMethod<[Principal], { 'Ok' : null } | { 'Err' : string }>,
  'areListed' : ActorMethod<[Array<bigint>], Array<boolean>>,
  'balance' : ActorMethod<[], bigint>,
  'bridgeBurnNXTFrom' : ActorMethod<
    [{ 'from' : Principal, 'amount' : bigint }],
    Result_2
  >,
  'bridgeMintNXT' : ActorMethod<
    [{ 'to' : Principal, 'amount' : bigint }],
    Result_2
  >,
  'bridgeTransferNXT' : ActorMethod<
    [{ 'to' : Principal, 'from' : Principal, 'amount' : bigint }],
    Result_2
  >,
  'burnFees' : ActorMethod<
    [],
    { 'Ok' : bigint } |
      { 'Err' : TransferError__1 }
  >,
  'createAuctionListing' : ActorMethod<
    [
      {
        'tokenId' : bigint,
        'endDate' : bigint,
        'reservePriceNXT' : [] | [bigint],
        'startPriceNXT' : bigint,
      },
    ],
    ListingResult
  >,
  'createSaleListing' : ActorMethod<
    [{ 'tokenId' : bigint, 'priceNXT' : bigint }],
    ListingResult
  >,
  'editProfile' : ActorMethod<
    [UserEditableData],
    { 'Ok' : User } |
      { 'Err' : string }
  >,
  'fetchSelectedUsers' : ActorMethod<[Array<Principal>], Array<[] | [User]>>,
  'generateAssetCoupon' : ActorMethod<
    [
      {
        'qty' : bigint,
        'metadata' : Array<[string, CandyShared]>,
        'expender' : Principal,
        'image' : Uint8Array | number[],
      },
    ],
    Array<bigint>
  >,
  'generateCoupons' : ActorMethod<
    [{ 'qty' : bigint, 'value' : bigint }],
    Array<bigint>
  >,
  'getAdmins' : ActorMethod<[], Array<User>>,
  'getAsset' : ActorMethod<[bigint], [] | [Uint8Array | number[]]>,
  'getAssetsCoupons' : ActorMethod<[], Array<AssetCoupon>>,
  'getBrands' : ActorMethod<[], Array<User>>,
  'getClaimedAssetsCoupons' : ActorMethod<[], Array<AssetCoupon>>,
  'getCollectedFees' : ActorMethod<[], bigint>,
  'getCouponsInfo' : ActorMethod<[], Array<NXTCoupon>>,
  'getDiscordUser' : ActorMethod<
    [string],
    { 'Ok' : User } |
      { 'Err' : string }
  >,
  'getExternalsByPrincipal' : ActorMethod<[Principal], Array<ExternalIdentity>>,
  'getLinkedAccounts' : ActorMethod<[], Array<ExternalIdentity>>,
  'getListingIdForTokens' : ActorMethod<[Array<bigint>], Array<[] | [bigint]>>,
  'getListings' : ActorMethod<[], Array<ListingPublic>>,
  'getOauthRewards' : ActorMethod<[], Array<[string, bigint]>>,
  'getProviderSecret' : ActorMethod<[string], [] | [string]>,
  'getRankings' : ActorMethod<[], RankingsTop20>,
  'getSubaccount' : ActorMethod<[], Uint8Array | number[]>,
  'getUserName' : ActorMethod<[string], { 'Ok' : string } | { 'Err' : null }>,
  'getUserSubaccount' : ActorMethod<[Principal], Uint8Array | number[]>,
  'getUsers' : ActorMethod<
    [{ 'page' : bigint, 'pageSize' : [] | [bigint] }],
    { 'hasMore' : boolean, 'items' : Array<User> }
  >,
  'icpAccountId' : ActorMethod<[], Uint8Array | number[]>,
  'imAdmin' : ActorMethod<[], boolean>,
  'linkOAuth' : ActorMethod<
    [{ 'provider' : string, 'code' : string, 'codeVerifier' : [] | [string] }],
    { 'Ok' : { 'userInfo' : UserInfo, 'user' : [] | [User] } } |
      { 'Err' : string }
  >,
  'loadAvatar' : ActorMethod<
    [[] | [Uint8Array | number[]]],
    { 'Ok' : User } |
      { 'Err' : string }
  >,
  'login' : ActorMethod<[], [] | [User]>,
  'redeemRWA' : ActorMethod<[bigint, string], Array<[] | [TransferResult]>>,
  'redeem_coupon' : ActorMethod<[bigint], { 'Ok' : null } | { 'Err' : string }>,
  'removeAdmin' : ActorMethod<
    [Principal],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'removeBrand' : ActorMethod<
    [Principal],
    { 'Ok' : null } |
      { 'Err' : string }
  >,
  'removeUser' : ActorMethod<[Principal], [] | [User]>,
  'sendNXST' : ActorMethod<[{ 'to' : string, 'amount' : bigint }], Result_2>,
  'signUp' : ActorMethod<
    [string, [] | [Principal]],
    { 'Ok' : User } |
      { 'Err' : string }
  >,
  'tokensOf' : ActorMethod<[], Array<bigint>>,
  'transferFrom' : ActorMethod<
    [{ 'to' : Uint8Array | number[], 'from' : Principal, 'amount' : bigint }],
    Result_6
  >,
  'transferRWA' : ActorMethod<
    [{ 'token_id' : bigint, 'toPrincipal' : Principal }],
    Array<[] | [TransferResult]>
  >,
  'transform' : ActorMethod<[TransformArg], HttpRequestResult>,
  'updateConfig' : ActorMethod<
    [Array<[string, Value__1]>],
    { 'Ok' : null } |
      { 'Err' : null }
  >,
  'withdraw' : ActorMethod<
    [
      {
        'to' : string,
        'subaccount' : [] | [Uint8Array | number[]],
        'amount' : bigint,
      },
    ],
    { 'Ok' : bigint } |
      { 'Err' : string }
  >,
}
export interface _SERVICE extends _anon_class_28_1 {}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];


