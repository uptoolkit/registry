"use client";

import { JsonLd, serializeJsonLd } from "./json-ld";

const data = {
  "@context": "https://schema.org",
  "@type": "SocialMediaPosting",
  "@id": "https://social.example/users/ada/posts/1",
  text: "Structured data ships with the markup </script>",
  author: { "@type": "Person", name: "Ada Okoye" },
};

export function Preview() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-2 text-left">
      <JsonLd data={data} id="preview-json-ld" />
      <p className="m-0 text-sm text-muted-foreground">
        The script tag is in the document. Its escaped contents:
      </p>
      <pre className="m-0 overflow-auto rounded-md bg-muted p-3 text-xs">
        {serializeJsonLd(data, 2)}
      </pre>
    </div>
  );
}
