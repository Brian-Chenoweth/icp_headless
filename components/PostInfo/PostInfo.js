import { FormatDate } from '../';
/**
 * PostInfo component renders post specific information.
 * @param {string} props.date The post publish date.
 * @param {string} props.author The post author's name.
 * @param {string} props.className An optional className to be added to the PostInfo.
 * @returns {React.ReactElement} The PostInfo component
 */
export default function PostInfo({ className, author, date }) {
  if (!date && !author) {
    return null;
  }

  return (
    <div className={className}>
      {author && <span>{author}</span>}
      <br/>
      {date && (
        <time dateTime={date}>
          <FormatDate date={date} />
        </time>
      )}
      {date && author && <>&nbsp;</>}

    </div>
  );
}
