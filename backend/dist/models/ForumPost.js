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
const ForumPostSchema = new mongoose_1.Schema({
    authorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000,
    },
    category: {
        type: String,
        enum: ['general', 'anxiety', 'depression', 'stress', 'support', 'achievement'],
        default: 'general',
    },
    tags: [{
            type: String,
            trim: true,
        }],
    likes: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        }],
    comments: [{
            authorId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            content: {
                type: String,
                required: true,
                trim: true,
                maxlength: 500,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }],
    isAnonymous: {
        type: Boolean,
        default: false,
    },
    mood: {
        type: String,
        enum: ['happy', 'sad', 'anxious', 'stressed', 'calm', 'overwhelmed'],
    },
    isApproved: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
ForumPostSchema.index({ authorId: 1 });
ForumPostSchema.index({ category: 1 });
ForumPostSchema.index({ tags: 1 });
ForumPostSchema.index({ mood: 1 });
ForumPostSchema.index({ isApproved: 1 });
ForumPostSchema.index({ createdAt: -1 });
exports.default = mongoose_1.default.model('ForumPost', ForumPostSchema);
//# sourceMappingURL=ForumPost.js.map