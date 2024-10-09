const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const slugify = require("slugify");

const index = async (req, res, next) => {
    const { published, search } = req.query;

    try {
        const posts = await prisma.post.findMany({
            where: {
                ...(published === "true" && { published: true }),
                ...(published === "false" && { published: false }),
            },
            include: {
                category: true,
                tags: true,
            },
        });

        // Filtro i post localmente utilizzando toLowerCase
        const filteredPosts =
            search && search.trim() !== ""
                ? posts.filter(
                      (post) =>
                          post.title
                              .toLowerCase()
                              .includes(search.toLowerCase()) ||
                          post.content
                              .toLowerCase()
                              .includes(search.toLowerCase())
                  )
                : posts;

        res.status(200).json({
            message: `Post trovati: ${filteredPosts.length}`,
            posts: filteredPosts,
        });
    } catch (error) {
        next(error);
    }
};

const show = async (req, res, next) => {
    const { slug } = req.params;

    try {
        const post = await prisma.post.findUnique({
            where: { slug: slug },
            include: {
                category: true,
                tags: true,
            },
        });

        if (!post) {
            return res.status(404).json({ message: "Post non esistente" });
        }

        res.status(200).json(post);
    } catch (error) {
        next(error);
    }
};

const store = async (req, res, next) => {
    const {
        title,
        image,
        content,
        published = false,
        categoryId,
        tags,
    } = req.body;

    const slug = slugify(title, {
        replacement: "-",
        lower: true,
        locale: "it",
        trim: true,
    });

    try {
        const post = await prisma.post.create({
            data: {
                title,
                slug,
                image,
                content,
                published,
                category: {
                    connect: { id: categoryId },
                },
                tags: {
                    connect: tags.map((tagId) => ({ id: tagId })),
                },
            },
        });
        res.status(201).json({ message: "Post creato correttamente", post });
    } catch (error) {
        next(error);
    }
};

const update = async (req, res, next) => {
    const { slug } = req.params;
    const {
        title,
        image,
        content,
        published,
        categoryId,
        tags,
        overwriteTags,
    } = req.body;

    try {
        const post = await prisma.post.findUnique({
            where: { slug },
            include: { tags: true }, // Includo i tag esistenti per manipolarli
        });

        if (!post) {
            return res.status(404).json({ message: "Post non trovato" });
        }

        const updateData = {};

        if (title) {
            updateData.title = title;
            updateData.slug = slugify(title, {
                replacement: "-",
                lower: true,
                locale: "it",
                trim: true,
            });
        }

        if (image) {
            updateData.image = image;
        }
        if (content) {
            updateData.content = content;
        }
        if (typeof published !== "undefined") {
            updateData.published = published;
        }

        // Aggiorna la categoria se fornita
        if (categoryId) {
            updateData.category = {
                connect: { id: categoryId },
            };
        }

        // Gestione dei tag
        if (tags && tags.length > 0) {
            if (overwriteTags) {
                // Sovrascrive i tag esistenti
                updateData.tags = {
                    disconnect: post.tags.map((tag) => ({ id: tag.id })),
                    connect: tags.map((tagId) => ({ id: tagId })),
                };
            } else {
                // Aggiunge i nuovi tag ai tag esistenti
                const existingTagIds = post.tags.map((tag) => tag.id);
                const newTagIds = tags.filter(
                    (tagId) => !existingTagIds.includes(tagId)
                );

                updateData.tags = {
                    connect: newTagIds.map((tagId) => ({ id: tagId })),
                };
            }
        }

        // Aggiorna il post
        const updatedPost = await prisma.post.update({
            where: { slug },
            data: updateData,
        });

        res.status(200).json({
            message: "Post aggiornato correttamente",
            post: updatedPost,
        });
    } catch (error) {
        next(error);
    }
};

const destroy = async (req, res, next) => {
    const { slug } = req.params;

    try {
        const post = await prisma.post.findUnique({
            where: { slug: slug },
        });

        if (!post) {
            return res.status(404).json({ message: "Post non trovato" });
        }

        await prisma.post.delete({
            where: { slug: slug },
        });

        res.status(200).json({ message: "Post eliminato correttamente" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    index,
    show,
    store,
    update,
    destroy,
};
