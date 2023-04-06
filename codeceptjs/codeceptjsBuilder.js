const stepMapping = {
    GET: 'sendGetRequest',
    POST: 'sendPostRequest',
    PATCH: 'sendPatchRequest',
    DELETE: 'sendDeleteRequest',
    PUT: 'sendPutRequest'
}
class CodeceptjsBuilder {
    entry;
    constructor(entry) {
        this.entry = entry
        if (!this.entry.name.includes('codeceptjs-')) throw Error('Please set the prefix codeceptjs- for the requests you want to export as CodeceptJS code')
    }

    headerBuild() {
        let headers = {}

        this.entry.headers.forEach(item => {
            headers[item['name']] = item['value']
        })

        return headers;
    }

    bodyBuild() {
        if (this.entry.body.mimeType === 'application/json') return this.entry.body.text
        if (this.entry.body.mimeType === 'multipart/form-data') {
            let body = `const form = new FormData();\n`
            this.entry.body.params.forEach(item => {
                if (item['fileName']) {
                    body += ` form.append("${item['name']}", "${item['fileName']}")\n`
                } else {
                    body += ` form.append("${item['name']}", "${item['value']}")\n`
                }
            })

            return body
        }
    }

    build(prefix) {
        const filename = this.entry.name.replace(prefix, "")
        let headers = this.headerBuild()
        const body = this.bodyBuild()

        let snippet = `Scenario("${filename}", async ({ I }) => {\n`
        if (this.entry.body.mimeType === 'multipart/form-data') {
            snippet += ` ${body}\n`
            snippet += ` I.${stepMapping[this.entry.method]}("${this.entry.url}", form, ${JSON.stringify(headers).replace('}', ', ...form.getHeaders() }')})\n`
        } else {
            snippet += ` I.${stepMapping[this.entry.method]}("${this.entry.url}", ${JSON.stringify(body)}, ${JSON.stringify(headers)})\n`
        }
        snippet += ` I.seeResponseCodeIs(200);\n`
        snippet += `});\n`
        snippet = snippet.replace(', undefined,', ',')

        return snippet
    }
}

module.exports = CodeceptjsBuilder;
