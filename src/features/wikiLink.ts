import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Wiki Link 提供者
 * 识别 [[文档名]] 和 [[文档名|显示文本]] 格式，提供点击跳转功能
 */
export class WikiLinkProvider implements vscode.DocumentLinkProvider {
    
    // Wiki Link 正则表达式
    private wikiLinkRegex = /\[\[([^\]|]+)(?:\|([^\]]*))?\]\]/g;

    /**
     * 扫描文档中的所有 Wiki Links
     */
    provideDocumentLinks(
        document: vscode.TextDocument,
        token: vscode.CancellationToken
    ): vscode.DocumentLink[] {
        const links: vscode.DocumentLink[] = [];
        const text = document.getText();
        
        let match;
        while ((match = this.wikiLinkRegex.exec(text)) !== null) {
            const fullMatch = match[0];
            const fileName = match[1].trim();
            const displayText = match[2]?.trim();
            
            // 计算匹配位置
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + fullMatch.length);
            const range = new vscode.Range(startPos, endPos);
            
            // 解析目标文件路径
            const targetUri = this.resolveTargetFile(document, fileName);
            
            if (targetUri) {
                const link = new vscode.DocumentLink(range, targetUri);
                link.tooltip = displayText 
                    ? `跳转到: ${fileName} (${displayText})`
                    : `跳转到: ${fileName}`;
                links.push(link);
            }
        }
        
        return links;
    }

    /**
     * 解析目标文件路径
     */
    private resolveTargetFile(
        sourceDocument: vscode.TextDocument,
        fileName: string
    ): vscode.Uri | undefined {
        const sourceDir = path.dirname(sourceDocument.fileName);
        
        // 支持的扩展名（按优先级）
        const extensions = ['.md', '.markdown', '.mdx'];
        
        // 1. 尝试直接匹配（相对路径）
        for (const ext of extensions) {
            const targetPath = path.join(sourceDir, fileName + ext);
            if (fs.existsSync(targetPath)) {
                return vscode.Uri.file(targetPath);
            }
        }
        
        // 2. 尝试在工作区中查找
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders) {
            for (const folder of workspaceFolders) {
                for (const ext of extensions) {
                    const targetPath = path.join(folder.uri.fsPath, fileName + ext);
                    if (fs.existsSync(targetPath)) {
                        return vscode.Uri.file(targetPath);
                    }
                }
                
                // 递归搜索（限制深度为 3）
                const foundPath = this.findFileRecursively(
                    folder.uri.fsPath, 
                    fileName, 
                    extensions,
                    3
                );
                if (foundPath) {
                    return vscode.Uri.file(foundPath);
                }
            }
        }
        
        // 3. 文件不存在，返回一个虚拟 URI（用于创建新文件）
        const newFilePath = path.join(sourceDir, fileName + '.md');
        return vscode.Uri.file(newFilePath).with({
            scheme: 'markdown-frontmatter-ops',
            query: `create=true&name=${encodeURIComponent(fileName)}`
        });
    }

    /**
     * 递归查找文件
     */
    private findFileRecursively(
        dir: string,
        fileName: string,
        extensions: string[],
        maxDepth: number
    ): string | undefined {
        if (maxDepth <= 0) return undefined;
        
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                    const found = this.findFileRecursively(
                        fullPath, 
                        fileName, 
                        extensions, 
                        maxDepth - 1
                    );
                    if (found) return found;
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name);
                    const name = path.basename(entry.name, ext);
                    if (name === fileName && extensions.includes(ext)) {
                        return fullPath;
                    }
                }
            }
        } catch (error) {
            // 忽略权限错误等
        }
        
        return undefined;
    }
}
