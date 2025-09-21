"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CounsellorScheduleSchema = new mongoose_1.Schema({
    counsellorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    dayOfWeek: {
        type: Number,
        required: true,
        min: 0,
        max: 6,
    },
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    maxSessionsPerSlot: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
    },
    sessionDuration: {
        type: Number,
        default: 60,
        min: 15,
        max: 180,
    },
    breakTime: {
        type: Number,
        default: 15,
        min: 0,
        max: 60,
    },
}, {
    timestamps: true,
});
CounsellorScheduleSchema.index({ counsellorId: 1, dayOfWeek: 1 });
CounsellorScheduleSchema.index({ counsellorId: 1, isAvailable: 1 });
exports.default = mongoose_1.default.model('CounsellorSchedule', CounsellorScheduleSchema);
//# sourceMappingURL=CounsellorSchedule.js.map