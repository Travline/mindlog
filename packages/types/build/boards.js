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
exports.BoardResSchema = exports.UpdateBoardSchema = exports.CreateBoardSchema = void 0;
const z = __importStar(require("zod"));
const CreateBoardSchema = z.object({
    title: z
        .string()
        .min(1, "El título es requerido")
        .max(200, "El título no puede superar los 200 caracteres"),
    description: z
        .string()
        .max(1000, "La descripción no puede superar los 1000 caracteres")
        .optional(),
});
exports.CreateBoardSchema = CreateBoardSchema;
const UpdateBoardSchema = z.object({
    title: z
        .string()
        .min(1, "El título es requerido")
        .max(200, "El título no puede superar los 200 caracteres")
        .optional(),
    description: z
        .string()
        .max(1000, "La descripción no puede superar los 1000 caracteres")
        .optional(),
});
exports.UpdateBoardSchema = UpdateBoardSchema;
const BoardResSchema = z.object({
    boardId: z.number(),
    title: z.string(),
    description: z.string().nullable(),
    ownerId: z.string(),
    createdAt: z.string().nullable(),
});
exports.BoardResSchema = BoardResSchema;
