class UserService {
    constructor(prisma) {
        this.prisma = prisma;
    }

    async createUser(data) {
        return await this.prisma.user.create({ data });
    }

    async getUser(id) {
        return await this.prisma.user.findUnique({ where: { id } });
    }

    async updateUser(id, data) {
        return await this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async deleteUser(id) {
        return await this.prisma.user.delete({ where: { id } });
    }

    async getAllUsers() {
        return await this.prisma.user.findMany();
    }
}

module.exports = UserService;