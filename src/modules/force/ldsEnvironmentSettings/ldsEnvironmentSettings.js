/*  *******************************************************************************************
 *  ATTENTION!
 *  THIS IS A GENERATED FILE FROM https://github.com/salesforce/lds-lightning-platform
 *  If you would like to contribute to LDS, please follow the steps outlined in the git repo.
 *  Any changes made to this file in p4 will be automatically overwritten.
 *  *******************************************************************************************
 */
/* proxy-compat-disable */
var EnvironmentSettings;
(function (EnvironmentSettings) {
    EnvironmentSettings["ForceRecordTransactionsDisabled"] = "forceRecordTransactionsDisabled";
})(EnvironmentSettings || (EnvironmentSettings = {}));
const GATE_FORCE_RECORD_TRANSACTIONS_DISABLED = '$Browser.S1Features.forceRecordTransactionsDisabled';
const supportedEnvironmentSettings = {
    [EnvironmentSettings.ForceRecordTransactionsDisabled]: GATE_FORCE_RECORD_TRANSACTIONS_DISABLED,
};
/**
 * Returns aura configuration settings. Used to check gate/perm statuses.
 * @param name Name of the setting to check.
 * @returns Value of the setting, or undefined if $A is not available.
 */
function getEnvironmentSetting(name) {
    const environmentSetting = supportedEnvironmentSettings[name];
    if (typeof window.$A !== 'undefined' && environmentSetting !== undefined) {
        return window.$A.get(environmentSetting);
    }
    return undefined;
}

export { EnvironmentSettings, getEnvironmentSetting };
// version: 1.11.3-03778f23
