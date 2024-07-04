import {Context, Probot} from 'probot'

const releaseImageText: Readonly<string> = '## Release Image'

const removeEmptyLines = (text: string): string => {
  return text
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n')
}

const hasReleaseImageLine = (body: string): boolean => {
  const lines = body.split('\n')
  return lines.findIndex((line) => line.trim() === releaseImageText) !== -1
}

const hasReleaseImageChanged = (oldBody: string, newBody: string): boolean => {
  const oLines = oldBody.split('\n')
  const nLines = newBody.split('\n')

  const oldIndex = oLines.findIndex((line) => line.trim() === releaseImageText)
  const newIndex = nLines.findIndex((line) => line.trim() === releaseImageText)

  const oldNextLine = oLines[oldIndex + 1]?.trim()
  const newNextLine = nLines[newIndex + 1]?.trim()

  return oldNextLine !== newNextLine
}

const hasReleaseImage = (body: string): boolean => {
  const lines = body.split('\n')
  const imageIndex = lines.findIndex((line) => line.trim() === releaseImageText)

  if (imageIndex === -1) {
    return false
  }

  const nextLine = lines[imageIndex + 1]?.trim()

  if (nextLine === 'N/A') return true

  const imageRegex = /(.*\/assets.*|\.(png|jpg|jpeg|gif|mp4|mov|avi|mkv|webm))/i

  return imageRegex.test(nextLine)
}

const handlePull = async (context: Context<'pull_request'>) => {
  const createComment = (comment: string) =>
    context.octokit.issues.createComment(context.issue({body: comment}))

  const body = removeEmptyLines(context.payload.pull_request.body!)
  const oldBody = removeEmptyLines(
    (context as any).payload.changes?.body?.from || '',
  )

  if (!hasReleaseImageLine(body)) {
    return await createComment(
      `😒 Remember to add a section for release images using "${releaseImageText}"`,
    )
  }

  if (hasReleaseImageChanged(oldBody, body)) {
    if (hasReleaseImage(body)) {
      return await createComment(
        '🚀 PR has release media and is ready for release.',
      )
    }
    return await createComment('❗Remember to add a release image/video')
  }

  return null
}

export default (app: Probot) => {
  app.on('pull_request.opened', handlePull)
  app.on('pull_request.edited', handlePull)
}
