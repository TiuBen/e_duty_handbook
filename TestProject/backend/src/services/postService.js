class PostService {
    constructor(prisma) {
        this.prisma = prisma;
    }

    async createPost(data) {
        return await this.prisma.post.create({
            data,
        });
    }

    async getPost(id) {
        return await this.prisma.post.findUnique({
            where: { id },
        });
    }

    async updatePost(id, data) {
        return await this.prisma.post.update({
            where: { id },
            data,
        });
    }

    async deletePost(id) {
        return await this.prisma.post.delete({
            where: { id },
        });
    }

    async getAllPosts() {
        return await this.prisma.post.findMany();
    }
}

module.exports = PostService;