import {
  Globby,
  getFolderContainingFile,
  getContentPathList,
  parseMarkdownString,
} from '@docusaurus/utils'
import { readFile } from 'fs-extra'
import { join } from 'path'
import type {
  PluginOptions,
  VersionMetadata,
} from '@docusaurus/plugin-content-docs'
import {
  LoadContext,
  Plugin,
  PluginContentLoadedActions,
} from '@docusaurus/types'
import { InputContent, LoadedContent } from './types'

async function readDocFile(
  versionMetadata: Pick<
    VersionMetadata,
    'contentPath' | 'contentPathLocalized'
  >,
  source: string
) {
  const contentPath = await getFolderContainingFile(
    getContentPathList(versionMetadata),
    source
  )

  const filePath = join(contentPath, source)

  const content = await readFile(filePath, 'utf-8')
  return { source, content, contentPath, filePath }
}

async function readVersionDocs(
  versionMetadata: Pick<
    VersionMetadata,
    'contentPath' | 'contentPathLocalized'
  >,
  options: Pick<PluginOptions, 'include' | 'exclude'>
) {
  const sources = await Globby(options.include, {
    cwd: versionMetadata.contentPath,
    ignore: options.exclude,
  })
  return Promise.all(
    sources.map((source) => readDocFile(versionMetadata, source))
  )
}

async function readPageFrontMatter(contentPath: string) {
  const docFiles = await readVersionDocs(
    {
      contentPath,
      contentPathLocalized: `.${contentPath}`,
    },
    {
      include: ['**/*.md'],
      exclude: [],
    }
  )

  return docFiles.map((docFile) => {
    const { source, content } = docFile
    const { frontMatter: unsafeFrontMatter } = parseMarkdownString(content)

    return {
      tags: unsafeFrontMatter.tags || [],
      source: source.replace('.md', ''),
    }
  })
}

export default function tagGraphPlugin(
  { siteConfig: { baseUrl } }: LoadContext,
  options: Partial<PluginOptions> & Partial<InputContent>
): Plugin<LoadedContent | null> {
  return {
    name: 'docusaurus-plugin-category-graph',
    async loadContent() {
      const tagMap = await readPageFrontMatter(`docs/docs`)

      const colours = {
        text: '#333',
        background: '#1fa588',
      }

      if (options && options.colours && options.colours.text) {
        colours.text = options.colours.text
      }

      if (options && options.colours && options.colours.background) {
        colours.background = options.colours.background
      }

      const data = {
        colours,
        tagMap,
        category: 'None Selected',
      }

      return data
    },
    async contentLoaded({
      content,
      actions,
    }: {
      readonly content: LoadedContent
      readonly actions: PluginContentLoadedActions
    }) {
      const { createData, addRoute } = actions

      const dataPath = await createData('data.json', JSON.stringify(content))

      addRoute({
        path: '/graph',
        component: `${baseUrl}docusaurus-plugin-category-graph/Graph.js`,
        modules: {
          graph: dataPath,
        },
        exact: true,
      })
    },
  }
}
