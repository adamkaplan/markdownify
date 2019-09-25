module.exports = app => {
  app.on('pull_request.opened', async context => {
    // Correct for deprecation in github pulls API
    var issueParams = context.issue()
    issueParams['pull_number'] = issueParams['number']
    delete issueParams['number']

    const results = await context.github.paginate(context.github.pulls.listFiles.endpoint.merge(issueParams, response => {                                                                
      response.data.filter(entry => {
        entry.status === 'added' && entry.filename.endsWith('.md')
      })
    }))

    if (results && results.length > 0) {
      // make URLs
      let urls = ''
      await results.forEach(async (result) => {
        urls += `\n[View rendered ${result.filename}](${context.payload.pull_request.head.repo.html_url}/blob/${context.payload.pull_request.head.ref}/${result.filename})`
      })
      await context.github.pulls.update(Object.assign(issueParams, {body: `${context.payload.pull_request.body}\n\n-----${urls}`}))
    }
  })
}
