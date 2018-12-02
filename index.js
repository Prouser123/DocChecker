//const getDCOStatus = require('./lib/dco.js')
//const requireMembers = require('./lib/requireMembers.js')

module.exports = app => {
  app.on(['pull_request.opened', 'pull_request.synchronize', 'check_run.rerequested'], check)

  async function check (context) {
    
    const pr = context.payload.pull_request

    const compare = await context.github.repos.compareCommits(context.repo({
      base: pr.base.sha,
      head: pr.head.sha
    }))
    
    
    const files = await context.github.pullRequests.getFiles(context.issue())
    const changedFiles = files.data.map(file => file.filename)
    app.log("[Debug] Changed Files: " + changedFiles)
    
    
    var sourceUpdated = false
    var docsUpdated = false
    for (var i2=changedFiles.length; i2--;) {
      //app.log(changedFiles[i2].indexOf("src/java"))
     if (changedFiles[i2].indexOf("src/java")>=0) {
       sourceUpdated = true
     }
      //app.log(changedFiles[i2].indexOf("docs"))
     if (changedFiles[i2].indexOf("docs")>=-0) {
       docsUpdated = true
     }
    }
    
    //ar docsUpdated = changedFiles.includes("docs/")
    //var sourceUpdated = changedFiles.includes("src/java/")
    app.log("[Debug] docsUpdated: " + docsUpdated)
    app.log("[Debug] sourceUpdated: " + sourceUpdated)
    
    if (docsUpdated && sourceUpdated) {
      app.log("[CreateStatus] Updated")
      // create status
      const params = {
        sha: pr.head.sha,
        context: 'DocChecker/updated',
        state: 'success',
        description: "You've updated your docs for your source changes.",
        //target_url: 'https://github.com/probot/dco#how-it-works'
      }
      return context.github.repos.createStatus(context.repo(params))
      
    } else if (!docsUpdated && sourceUpdated) {
      app.log("[CreateStatus] NoDoc")
      // create status
      const params = {
        sha: pr.head.sha,
        context: 'DocChecker/update-docs',
        state: 'pending',
        description: 'Update docs to match source code.',
        //target_url: 'https://github.com/probot/dco#how-it-works'
      }
      return context.github.repos.createStatus(context.repo(params))
      
    } else {
      app.log("[CreateStatus] N/A")
      // create status
      const params = {
        sha: pr.head.sha,
        context: 'DocChecker/na',
        state: 'success',
        description: 'Source code not edited, documentation update not required.',
         //target_url: 'https://github.com/probot/dco#how-it-works'
      }
      return context.github.repos.createStatus(context.repo(params))
    }
  }
}