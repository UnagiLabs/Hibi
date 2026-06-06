#[test_only]
module hibi_contracts::family_tests;

use std::string::utf8;
use sui::test_scenario as ts;
use hibi_contracts::family::{
    Self,
    new_admin_cap_for_testing,
    new_family_vault,
    new_member_for_testing,
    destroy_admin_cap_for_testing,
    destroy_family_vault_for_testing,
    destroy_member_for_testing,
};

const ADMIN: address = @0xA11CE;

#[test]
fun add_album_record_with_member_sbt() {
    let mut scenario = ts::begin(ADMIN);
    scenario.next_tx(ADMIN);

    let admin_cap = new_admin_cap_for_testing(scenario.ctx());
    let mut vault = new_family_vault(&admin_cap, utf8(b"family_demo"), scenario.ctx());
    let member = new_member_for_testing(
        &vault,
        utf8(b"Numa"),
        utf8(b"guardian"),
        scenario.ctx(),
    );

    vault.add_album_record(
        &member,
        utf8(b"monthly_growth_album"),
        2026,
        6,
        utf8(b"walrus_blob_id"),
        utf8(b"sha256_hash"),
        1780725911321,
    );

    assert!(vault.album_count() == 1);
    let record = vault.borrow_album(0);
    assert!(record.target_year() == 2026);
    assert!(record.target_month() == 6);

    destroy_member_for_testing(member);
    destroy_family_vault_for_testing(vault);
    destroy_admin_cap_for_testing(admin_cap);
    ts::end(scenario);
}

#[test]
#[expected_failure(abort_code = family::EInvalidMonth)]
fun reject_invalid_album_month() {
    let mut scenario = ts::begin(ADMIN);
    scenario.next_tx(ADMIN);

    let admin_cap = new_admin_cap_for_testing(scenario.ctx());
    let mut vault = new_family_vault(&admin_cap, utf8(b"family_demo"), scenario.ctx());
    let member = new_member_for_testing(
        &vault,
        utf8(b"Numa"),
        utf8(b"guardian"),
        scenario.ctx(),
    );

    vault.add_album_record(
        &member,
        utf8(b"monthly_growth_album"),
        2026,
        13,
        utf8(b"walrus_blob_id"),
        utf8(b"sha256_hash"),
        1780725911321,
    );

    destroy_member_for_testing(member);
    destroy_family_vault_for_testing(vault);
    destroy_admin_cap_for_testing(admin_cap);
    ts::end(scenario);
}
