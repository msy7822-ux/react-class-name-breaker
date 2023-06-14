import {
  ExtensionContext,
  workspace,
  TextEditor,
  window,
  WorkspaceEdit,
  Range,
} from "vscode";
import { getClassNames, getUtility } from "./utils/regex";

const decorate = (editor: TextEditor) => {
  if (editor === null) {
    return;
  }

  const document = editor.document;
  const text = document.getText();
  const classNames = getClassNames(text);
  classNames?.map((className) => {
    return className.value
      .replace(/\n|,|'|`|"|{|}/g, " ")
      .split(" ")
      .filter(Boolean);
  }) ?? [];

  const regexes = [
    /(?:\b(?:class(?:Name)?|tw)\s*=\s*(?:(?:{([^>}]+)})|(["'`][^"'`]+["'`])))/,
    /(?:(clsx|classnames)\()([^)]+)\)/,
  ];
  const regex = new RegExp(regexes.map((r) => r.source).join("|"), "gm");

  classNames.forEach((className) => {
    const chars: any[] = [];
    const utilities = getUtility(className.value, regex);
    utilities.forEach((utility) => {
      const start = document.positionAt(className.start + utility.start);
      const end = document.positionAt(className.start + utility.end);
      const range = new Range(start, end);
      chars.push({ range });
    });

    console.log("chars", chars);
    //     editor.setDecorations(decorator.decorator, chars);
  });
  // });
};

export async function activate(context: ExtensionContext) {
  const editor = window.activeTextEditor;
  const arr = decorate(editor!);
  const doc = editor?.document;
  const texts = doc?.getText();

  // const classNames: string[] = [];

  // classes.map((classNameBlock) => {
  //   if (classNameBlock.length > 4) {
  //     return classNameBlock.map((className, i) => {
  //       const index = i + 1;

  //       return className;
  //     });
  //   } else {
  //     classNames.push(classNameBlock.join(" "));
  //   }
  // });

  // console.log("resp", resp);

  const newText = texts?.replace(/your_string/g, "\n") ?? "";

  let fullRange = doc?.validateRange(
    new Range(0, 0, Number.MAX_VALUE, Number.MAX_VALUE)
  );
  let edit = new WorkspaceEdit();
  edit.replace(doc?.uri!, fullRange!, newText);
  const res = await workspace.applyEdit(edit);

  // console.log("classes", classes);

  // workspace.onDidChangeTextDocument(
  //   (_event) => {
  //     console.log("onDidChangeTextDocument");
  //   },
  //   null,
  //   context.subscriptions
  // );
}

export function deactivate() {}
