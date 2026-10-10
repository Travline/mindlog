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
exports.LoginUserResSchema = exports.LoginUserSchema = exports.CreateUserResSchema = exports.CreateUserSchema = void 0;
const z = __importStar(require("zod"));
const CreateUserSchema = z.object({
    username: z
        .string()
        .min(2, "Ingresa un nombre valido con al menos 2 caracteres")
        .max(100),
    email: z
        .email("Ingresa un correo valido"),
    password: z
        .string()
        .min(8, "La contraseña debe contener al menos 8 caracteres")
        .max(100),
});
exports.CreateUserSchema = CreateUserSchema;
const CreateUserResSchema = z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string(),
});
exports.CreateUserResSchema = CreateUserResSchema;
const LoginUserSchema = z.object({
    email: z
        .email("Ingresa un correo valido"),
    password: z
        .string()
        .min(8, "La contraseña debe contener al menos 8 caracteres")
        .max(100),
});
exports.LoginUserSchema = LoginUserSchema;
const LoginUserResSchema = z.object({
    userId: z.string(),
    username: z.string(),
    email: z.string(),
});
exports.LoginUserResSchema = LoginUserResSchema;
