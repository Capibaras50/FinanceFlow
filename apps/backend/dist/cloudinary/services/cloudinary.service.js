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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const common_1 = require("@nestjs/common");
const streamifier = __importStar(require("streamifier"));
const axios_1 = __importDefault(require("axios"));
let CloudinaryService = class CloudinaryService {
    async uploadFile(file) {
        return new Promise((resolve, reject) => {
            const upload = cloudinary_1.v2.uploader.upload_stream({
                folder: 'finance-flow',
                resource_type: 'auto',
            }, (err, result) => {
                if (err) {
                    const message = err instanceof Error ? err.message : 'Upload failed';
                    return reject(new Error(message));
                }
                const url = result?.secure_url || result?.url;
                if (!url)
                    return reject(new Error('Upload failed: No URL returned'));
                resolve(url);
            });
            streamifier.createReadStream(file.buffer).pipe(upload);
        });
    }
    async getFileAsBase64(fileUrl) {
        const response = await axios_1.default.get(fileUrl, {
            responseType: 'arraybuffer',
        });
        const contentType = (response.headers['content-type'] ||
            response.headers['Content-Type']);
        const buffer = Buffer.from(response.data);
        const base64 = buffer.toString('base64');
        const sizeBytes = buffer.byteLength;
        return { mimeType: contentType, base64, sizeBytes };
    }
};
exports.CloudinaryService = CloudinaryService;
exports.CloudinaryService = CloudinaryService = __decorate([
    (0, common_1.Injectable)()
], CloudinaryService);
//# sourceMappingURL=cloudinary.service.js.map