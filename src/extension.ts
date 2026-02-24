import * as vscode from 'vscode';
import { WikiLinkProvider } from './features/wikiLink';

export function activate(context: vscode.ExtensionContext) {
    console.log('Markdown FrontMatter Ops 插件已激活');

    // 注册 Wiki Link 提供者
    const wikiLinkProvider = new WikiLinkProvider();
    
    // 为 Markdown 文件注册文档链接提供者
    context.subscriptions.push(
        vscode.languages.registerDocumentLinkProvider(
            { scheme: 'file', language: 'markdown' },
            wikiLinkProvider
        )
    );

    // 注册命令
    context.subscriptions.push(
        vscode.commands.registerCommand('markdownFrontMatterOps.scanWikiLinks', () => {
            vscode.window.showInformationMessage('Wiki Links 扫描完成');
        })
    );
}

export function deactivate() {}
