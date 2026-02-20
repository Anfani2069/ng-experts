import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy,
  forwardRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import Quill from 'quill';

@Component({
  selector: 'app-rich-text-editor',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true
    }
  ],
  template: `
    <div class="rich-text-editor">
      <div #toolbar id="toolbar">
        <span class="ql-formats">
          <button class="ql-bold" type="button"></button>
          <button class="ql-italic" type="button"></button>
          <button class="ql-underline" type="button"></button>
          <button class="ql-strike" type="button"></button>
        </span>
        <span class="ql-formats">
          <select class="ql-header">
            <option value="1">Titre 1</option>
            <option value="2">Titre 2</option>
            <option value="3">Titre 3</option>
            <option selected>Normal</option>
          </select>
        </span>
        <span class="ql-formats">
          <button class="ql-list" value="ordered" type="button"></button>
          <button class="ql-list" value="bullet" type="button"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-indent" value="-1" type="button"></button>
          <button class="ql-indent" value="+1" type="button"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-link" type="button"></button>
        </span>
        <span class="ql-formats">
          <button class="ql-clean" type="button"></button>
        </span>
      </div>
      <div #editor [style.height]="height"></div>
    </div>
  `,
  styles: [`
    .rich-text-editor {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      overflow: hidden;
      background: rgba(255, 255, 255, 0.05);
    }

    :host ::ng-deep .ql-toolbar {
      background: rgba(255, 255, 255, 0.03);
      border: none;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding: 8px;
    }

    :host ::ng-deep .ql-container {
      border: none;
      font-family: inherit;
    }

    :host ::ng-deep .ql-editor {
      min-height: 150px;
      padding: 12px 16px;
      color: white;
      font-size: 14px;
      line-height: 1.6;
    }

    :host ::ng-deep .ql-editor.ql-blank::before {
      color: rgba(255, 255, 255, 0.4);
      font-style: normal;
    }

    :host ::ng-deep .ql-stroke {
      stroke: rgba(255, 255, 255, 0.6);
    }

    :host ::ng-deep .ql-fill {
      fill: rgba(255, 255, 255, 0.6);
    }

    :host ::ng-deep .ql-picker-label {
      color: rgba(255, 255, 255, 0.6);
    }

    :host ::ng-deep button:hover .ql-stroke,
    :host ::ng-deep button:focus .ql-stroke,
    :host ::ng-deep button.ql-active .ql-stroke {
      stroke: #ec4899;
    }

    :host ::ng-deep button:hover .ql-fill,
    :host ::ng-deep button:focus .ql-fill,
    :host ::ng-deep button.ql-active .ql-fill {
      fill: #ec4899;
    }

    :host ::ng-deep .ql-picker-label:hover,
    :host ::ng-deep .ql-picker-label.ql-active {
      color: #ec4899;
    }

    :host ::ng-deep .ql-picker-options {
      background: #1a1a1a;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    :host ::ng-deep .ql-picker-item {
      color: rgba(255, 255, 255, 0.8);
    }

    :host ::ng-deep .ql-picker-item:hover {
      color: #ec4899;
    }

    :host ::ng-deep .ql-editor strong {
      font-weight: bold;
    }

    :host ::ng-deep .ql-editor em {
      font-style: italic;
    }

    :host ::ng-deep .ql-editor u {
      text-decoration: underline;
    }

    :host ::ng-deep .ql-editor a {
      color: #ec4899;
      text-decoration: underline;
    }

    :host ::ng-deep .ql-editor h1 {
      font-size: 2em;
      font-weight: bold;
      margin: 0.67em 0;
    }

    :host ::ng-deep .ql-editor h2 {
      font-size: 1.5em;
      font-weight: bold;
      margin: 0.83em 0;
    }

    :host ::ng-deep .ql-editor h3 {
      font-size: 1.17em;
      font-weight: bold;
      margin: 1em 0;
    }

    :host ::ng-deep .ql-editor ul,
    :host ::ng-deep .ql-editor ol {
      padding-left: 1.5em;
    }

    :host ::ng-deep .ql-editor li {
      margin: 0.5em 0;
    }
  `]
})
export class RichTextEditorComponent implements AfterViewInit, OnDestroy, OnChanges, ControlValueAccessor {
  @ViewChild('editor', { static: false }) editorElement!: ElementRef;
  @ViewChild('toolbar', { static: false }) toolbarElement!: ElementRef;

  @Input() placeholder = 'Écrivez quelque chose...';
  @Input() height = '200px';
  @Input() initialValue = '';
  @Output() contentChange = new EventEmitter<string>();

  private quill: Quill | null = null;
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};
  private isUserTyping = false;

  ngAfterViewInit(): void {
    this.initializeEditor();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Ne pas réagir aux changements si l'utilisateur est en train de taper
    if (changes['initialValue'] && this.quill && !this.isUserTyping) {
      const newValue = changes['initialValue'].currentValue;
      const currentValue = this.quill.root.innerHTML;

      // Ne mettre à jour que si la valeur est vraiment différente et non vide
      if (newValue !== currentValue && newValue !== '<p><br></p>') {
        if (newValue) {
          this.quill.root.innerHTML = newValue;
        } else {
          this.quill.setText('');
        }
      }
    }
  }

  ngOnDestroy(): void {
    if (this.quill) {
      this.quill = null;
    }
  }

  private initializeEditor(): void {
    this.quill = new Quill(this.editorElement.nativeElement, {
      modules: {
        toolbar: this.toolbarElement.nativeElement
      },
      placeholder: this.placeholder,
      theme: 'snow'
    });

    // Initialiser avec la valeur initiale si elle existe
    if (this.initialValue) {
      this.quill.root.innerHTML = this.initialValue;
    }

    this.quill.on('text-change', (_delta: any, _oldDelta: any, source: string) => {
      // Marquer que l'utilisateur est en train de taper
      if (source === 'user') {
        this.isUserTyping = true;
        setTimeout(() => this.isUserTyping = false, 100);
      }

      const html = this.quill?.root.innerHTML || '';
      this.onChange(html);
      this.contentChange.emit(html);
    });

    this.quill.on('selection-change', () => {
      this.onTouched();
    });
  }

  writeValue(value: string): void {
    if (this.quill) {
      if (value) {
        this.quill.root.innerHTML = value;
      } else {
        this.quill.setText('');
      }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (this.quill) {
      this.quill.enable(!isDisabled);
    }
  }
}
