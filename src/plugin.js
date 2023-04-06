const fs = require("fs");
const CodeceptjsBuilder = require("../codeceptjs/codeceptjsBuilder");

module.exports.workspaceActions = [
    {
        label: "generate CodeceptJS code",
        icon: "fa-code",
        action: async (context, models) => {
            const ex = await context.data.export.insomnia({
                includePrivate: false,
                workspace: models.workspace
            });
            const parsed = JSON.parse(ex);

            let filteredEntries = new Set()

            const prefix = await context.app.prompt('The prefix of the requests you want to export?', { label: 'prefix', defaultValue: 'codeceptjs-'})
            const path = context.app.getPath('Desktop')

            for (let i = 0; i < parsed.resources.length; i++) {
                const name = parsed.resources[i].name
                if (name && name.includes(prefix) === true) filteredEntries.add(parsed.resources[i])
            }

            if (filteredEntries.length < 0) return

            filteredEntries.forEach(entry => {
                const filename = entry.name.replace(prefix, "")
                const snippet = new CodeceptjsBuilder(entry)

                //save file to users desktop
                fs.writeFileSync(
                    `${path}/${filename}.js`,
                    snippet.build(prefix)
                )
            })
        }
    }
];
