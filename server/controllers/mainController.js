exports.homepage = async (req, res) => {
    const locals = {
        title: "Notion Clone",
        description: "Created by NodeJS"
    };

    res.render('index', locals);
}