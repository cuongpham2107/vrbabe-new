"use client"
import ClientOnly from '@/components/CLientOnly';
import { Editor } from '@tinymce/tinymce-react'
import React, { useRef, InputHTMLAttributes, FC, memo } from 'react'
import type { Editor as TinyMCEEditor } from 'tinymce';

type Props = InputHTMLAttributes<HTMLTextAreaElement> & {
  label?: string | null | undefined,
}

const RichTextAdmin: FC<Props> = (props) => {
  const { className, label, onChange, value, defaultValue, name, ...rest } = props

  const editorRef = useRef<TinyMCEEditor | null>(null)

  const handleEditorChange = (content: string, editor: TinyMCEEditor) => {
    const syntheticEvent: any = {
      target: {
        ...editor.getElement(),
        value: content
      },
    };

    onChange?.(syntheticEvent)
  }

  const handleEditorBlur = (event: {focusedEditor: TinyMCEEditor | null}) => {
    const content = event.focusedEditor?.getContent()

    const syntheticEvent: any = {
      target: {
        ...event.focusedEditor?.getElement(),
        value: content
      },
    };

    if (content) {
      onChange?.(syntheticEvent)
    }
  }

  return (
    <ClientOnly className={className}>
      { label ? 
        <label className="inline-block text-sm font-medium mb-2 dark:text-white">
          {label} { props.required && <span className="text-red-500">*</span> }
        </label> 
        : null 
      }
      <div>
        <style jsx global>{`
          /* .tox-tinymce-aux {
            display: none !important;
          } */
        `}</style>
        <Editor
          apiKey='533bnxknzoiro9lr6pa0oawuiww55hjjdqx4hlfledrf210z'
          onInit={(evt, editor) => {editorRef.current = editor}}
          // tinymceScriptSrc={'/js/tinymce/tinymce.min.js'}
          onEditorChange={handleEditorChange}
          onBlur={handleEditorBlur}
          initialValue={defaultValue as any}
          value={value as any}
          tagName={name}
          init={{
            height: 300,
            min_height: 300,
            menubar: false,
            "plugins": [
              "advlist","autolink", "autoresize",
              "lists","link","image","charmap","preview","anchor","searchreplace","visualblocks",
              "fullscreen","insertdatetime","media","table","help","wordcount", "code", "codesample"
            ],
            toolbar: "styles | alignleft aligncenter alignright | bold italic forecolor backcolor | bullist numlist | link image table codesample | code fullscreen ",
            content_style: `body { font-family:Helvetica,Arial,sans-serif; font-size:14px }`,
            images_upload_url: '/api/admin/images/upload-tinymce'
          }}
        />
      </div>
    </ClientOnly>
  )
}

export default memo(RichTextAdmin)