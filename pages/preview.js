import SEO from '@components/SEO';
import { WordPressTemplate } from '@faustwp/core';

export default function Preview(props) {
  return (
    <>
      <SEO title="Preview" noIndex={true} noFollow={true} url="/preview" />
      <WordPressTemplate {...props} />
    </>
  );
}
