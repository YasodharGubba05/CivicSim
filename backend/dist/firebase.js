"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = exports.db = void 0;
const app_1 = require("firebase-admin/app");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Placeholder initialization. In a real environment, provide service account credentials.
if (!(0, app_1.getApps)().length) {
    try {
        // If a service account path is available, use it. Otherwise placeholder default.
        if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
            (0, app_1.initializeApp)({
                credential: (0, app_1.cert)(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
            });
        }
        else {
            (0, app_1.initializeApp)();
            console.warn("Firebase initialized without dedicated credentials. Defaults heavily to project defaults.");
        }
    }
    catch (e) {
        console.error("Firebase init failed: ", e);
    }
}
exports.db = (0, firestore_1.getFirestore)();
exports.auth = (0, auth_1.getAuth)();
