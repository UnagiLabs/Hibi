/// Family ownership and album proof records for Hibi.
///
/// Walrus stores the heavy data. Sui stores the family membership object and
/// the small AlbumManifest pointer needed to verify what was archived.
module hibi_contracts::family;

use std::string::String;
use sui::event;

// === Errors ===

const EWrongVault: u64 = 0;
const EInvalidMonth: u64 = 1;

// === Structs ===

/// Package administrator capability. The holder can create vaults and mint
/// family member SBTs.
public struct AdminCap has key {
    id: UID,
}

/// Shared object representing one family archive.
public struct FamilyVault has key {
    id: UID,
    family_id: String,
    owner: address,
    album_count: u64,
    albums: vector<AlbumRecord>,
}

/// Soulbound family membership object.
///
/// It intentionally has no `store` ability, so wallets cannot freely transfer
/// it with `public_transfer`.
public struct FamilyMemberSBT has key {
    id: UID,
    vault_id: ID,
    display_name: String,
    role: String,
}

/// Small on-chain pointer to an AlbumManifest stored on Walrus.
public struct AlbumRecord has copy, drop, store {
    album_type: String,
    target_year: u64,
    target_month: u8,
    manifest_walrus_blob_id: String,
    manifest_sha256: String,
    created_at_ms: u64,
}

// === Events ===

public struct FamilyVaultCreatedEvent has copy, drop {
    vault_id: ID,
    owner: address,
}

public struct FamilyMemberMintedEvent has copy, drop {
    vault_id: ID,
    member_id: ID,
    recipient: address,
}

public struct AlbumRecordAddedEvent has copy, drop {
    vault_id: ID,
    album_index: u64,
    target_year: u64,
    target_month: u8,
}

// === Init ===

fun init(ctx: &mut TxContext) {
    transfer::transfer(
        AdminCap {
            id: object::new(ctx),
        },
        ctx.sender(),
    )
}

// === Public Functions ===

/// Creates a new family vault object. Call `share_family_vault` to make it
/// available for album updates.
public fun new_family_vault(
    _: &AdminCap,
    family_id: String,
    ctx: &mut TxContext,
): FamilyVault {
    let vault = FamilyVault {
        id: object::new(ctx),
        family_id,
        owner: ctx.sender(),
        album_count: 0,
        albums: vector[],
    };

    event::emit(FamilyVaultCreatedEvent {
        vault_id: object::id(&vault),
        owner: vault.owner,
    });

    vault
}

/// Shares a family vault so Hibi can append album records.
public fun share_family_vault(vault: FamilyVault) {
    transfer::share_object(vault)
}

/// Convenience entry point for local setup and scripts.
public fun create_and_share_family_vault(
    cap: &AdminCap,
    family_id: String,
    ctx: &mut TxContext,
) {
    new_family_vault(cap, family_id, ctx).share_family_vault()
}

/// Mints a non-transferable family membership SBT to `recipient`.
public fun mint_member(
    vault: &FamilyVault,
    _: &AdminCap,
    display_name: String,
    role: String,
    recipient: address,
    ctx: &mut TxContext,
) {
    let member = FamilyMemberSBT {
        id: object::new(ctx),
        vault_id: object::id(vault),
        display_name,
        role,
    };
    let member_id = object::id(&member);

    event::emit(FamilyMemberMintedEvent {
        vault_id: object::id(vault),
        member_id,
        recipient,
    });

    transfer::transfer(member, recipient)
}

/// Adds an AlbumManifest pointer to the family vault.
public fun add_album_record(
    vault: &mut FamilyVault,
    member: &FamilyMemberSBT,
    album_type: String,
    target_year: u64,
    target_month: u8,
    manifest_walrus_blob_id: String,
    manifest_sha256: String,
    created_at_ms: u64,
) {
    assert!(member.vault_id == object::id(vault), EWrongVault);
    assert!(target_month >= 1 && target_month <= 12, EInvalidMonth);

    let album_index = vault.album_count;
    vault.albums.push_back(AlbumRecord {
        album_type,
        target_year,
        target_month,
        manifest_walrus_blob_id,
        manifest_sha256,
        created_at_ms,
    });
    vault.album_count = album_index + 1;

    event::emit(AlbumRecordAddedEvent {
        vault_id: object::id(vault),
        album_index,
        target_year,
        target_month,
    })
}

// === View Functions ===

public fun vault_id(vault: &FamilyVault): ID {
    object::id(vault)
}

public fun family_id(vault: &FamilyVault): &String {
    &vault.family_id
}

public fun owner(vault: &FamilyVault): address {
    vault.owner
}

public fun album_count(vault: &FamilyVault): u64 {
    vault.album_count
}

public fun borrow_album(vault: &FamilyVault, index: u64): &AlbumRecord {
    &vault.albums[index]
}

public fun member_vault_id(member: &FamilyMemberSBT): ID {
    member.vault_id
}

public fun member_display_name(member: &FamilyMemberSBT): &String {
    &member.display_name
}

public fun member_role(member: &FamilyMemberSBT): &String {
    &member.role
}

public fun album_type(record: &AlbumRecord): &String {
    &record.album_type
}

public fun target_year(record: &AlbumRecord): u64 {
    record.target_year
}

public fun target_month(record: &AlbumRecord): u8 {
    record.target_month
}

public fun manifest_walrus_blob_id(record: &AlbumRecord): &String {
    &record.manifest_walrus_blob_id
}

public fun manifest_sha256(record: &AlbumRecord): &String {
    &record.manifest_sha256
}

public fun created_at_ms(record: &AlbumRecord): u64 {
    record.created_at_ms
}

// === Test Functions ===

#[test_only]
public fun new_admin_cap_for_testing(ctx: &mut TxContext): AdminCap {
    AdminCap {
        id: object::new(ctx),
    }
}

#[test_only]
public fun new_member_for_testing(
    vault: &FamilyVault,
    display_name: String,
    role: String,
    ctx: &mut TxContext,
): FamilyMemberSBT {
    FamilyMemberSBT {
        id: object::new(ctx),
        vault_id: object::id(vault),
        display_name,
        role,
    }
}

#[test_only]
public fun destroy_admin_cap_for_testing(cap: AdminCap) {
    let AdminCap { id } = cap;
    id.delete()
}

#[test_only]
public fun destroy_member_for_testing(member: FamilyMemberSBT) {
    let FamilyMemberSBT {
        id,
        vault_id: _,
        display_name: _,
        role: _,
    } = member;
    id.delete()
}

#[test_only]
public fun destroy_family_vault_for_testing(vault: FamilyVault) {
    let FamilyVault {
        id,
        family_id: _,
        owner: _,
        album_count: _,
        albums: _,
    } = vault;
    id.delete()
}
