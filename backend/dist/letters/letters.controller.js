"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LettersController = void 0;
const common_1 = require("@nestjs/common");
const letters_service_1 = require("./letters.service");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
let LettersController = class LettersController {
    constructor(lettersService) {
        this.lettersService = lettersService;
    }
    async getDashboardStats(search, status, issuer) {
        return this.lettersService.getDashboardStats(search, status, issuer);
    }
    async generateLetter(req, body, file) {
        return this.lettersService.createLetter(req.user.id, body, file);
    }
    async verifyPublicLetter(id, accountNumber) {
        return this.lettersService.verifyLetter(id, accountNumber);
    }
    async verifyPublicLetterPost(id, body) {
        return this.lettersService.verifyLetter(id, body?.accountNumber);
    }
    async downloadPdf(id, res) {
        const filePath = await this.lettersService.getPdfFile(id);
        return res.sendFile(filePath);
    }
};
exports.LettersController = LettersController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Query)('search')),
    __param(1, (0, common_1.Query)('status')),
    __param(2, (0, common_1.Query)('issuer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], LettersController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('generate'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], LettersController.prototype, "generateLetter", null);
__decorate([
    (0, common_1.Get)('verify/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('accountNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], LettersController.prototype, "verifyPublicLetter", null);
__decorate([
    (0, common_1.Post)('verify/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LettersController.prototype, "verifyPublicLetterPost", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], LettersController.prototype, "downloadPdf", null);
exports.LettersController = LettersController = __decorate([
    (0, common_1.Controller)('letters'),
    __metadata("design:paramtypes", [letters_service_1.LettersService])
], LettersController);
//# sourceMappingURL=letters.controller.js.map