import {
  registerPlugin
} from "./chunk-HAGEDCAJ.js";
import "./chunk-QHQP2P2Z.js";

// node_modules/@capawesome/capacitor-app-update/dist/esm/definitions.js
var AppUpdateAvailability;
(function(AppUpdateAvailability2) {
  AppUpdateAvailability2[AppUpdateAvailability2["UNKNOWN"] = 0] = "UNKNOWN";
  AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_NOT_AVAILABLE"] = 1] = "UPDATE_NOT_AVAILABLE";
  AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_AVAILABLE"] = 2] = "UPDATE_AVAILABLE";
  AppUpdateAvailability2[AppUpdateAvailability2["UPDATE_IN_PROGRESS"] = 3] = "UPDATE_IN_PROGRESS";
})(AppUpdateAvailability || (AppUpdateAvailability = {}));
var FlexibleUpdateInstallStatus;
(function(FlexibleUpdateInstallStatus2) {
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["UNKNOWN"] = 0] = "UNKNOWN";
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["PENDING"] = 1] = "PENDING";
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["DOWNLOADING"] = 2] = "DOWNLOADING";
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["INSTALLING"] = 3] = "INSTALLING";
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["INSTALLED"] = 4] = "INSTALLED";
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["FAILED"] = 5] = "FAILED";
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["CANCELED"] = 6] = "CANCELED";
  FlexibleUpdateInstallStatus2[FlexibleUpdateInstallStatus2["DOWNLOADED"] = 11] = "DOWNLOADED";
})(FlexibleUpdateInstallStatus || (FlexibleUpdateInstallStatus = {}));
var AppUpdateResultCode;
(function(AppUpdateResultCode2) {
  AppUpdateResultCode2[AppUpdateResultCode2["OK"] = 0] = "OK";
  AppUpdateResultCode2[AppUpdateResultCode2["CANCELED"] = 1] = "CANCELED";
  AppUpdateResultCode2[AppUpdateResultCode2["FAILED"] = 2] = "FAILED";
  AppUpdateResultCode2[AppUpdateResultCode2["NOT_AVAILABLE"] = 3] = "NOT_AVAILABLE";
  AppUpdateResultCode2[AppUpdateResultCode2["NOT_ALLOWED"] = 4] = "NOT_ALLOWED";
  AppUpdateResultCode2[AppUpdateResultCode2["INFO_MISSING"] = 5] = "INFO_MISSING";
})(AppUpdateResultCode || (AppUpdateResultCode = {}));

// node_modules/@capawesome/capacitor-app-update/dist/esm/index.js
var AppUpdate = registerPlugin("AppUpdate", {
  web: () => import("./web-GEIZQREV.js").then((m) => new m.AppUpdateWeb())
});
export {
  AppUpdate,
  AppUpdateAvailability,
  AppUpdateResultCode,
  FlexibleUpdateInstallStatus
};
//# sourceMappingURL=@capawesome_capacitor-app-update.js.map
