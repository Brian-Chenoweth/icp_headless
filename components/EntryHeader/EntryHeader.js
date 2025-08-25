import className from 'classnames/bind';
import { FeaturedImage, Heading, PostInfo } from '../../components';
import styles from './EntryHeader.module.scss';

const cx = className.bind(styles);

/**
 * A Page or Post entry header component
 */
export default function EntryHeader({
  title,
  image,
  date,
  author,
  className,
  isSingle = false, 
}) {
  const hasText = title || date || author;

  return (
    <div className={cx(['entry-header', className, { container: !isSingle }])}>
      {hasText && (
        <div>
          <div className={cx('text')}>
            {!!title && <Heading className={cx('title')}>{title}</Heading>}
            <PostInfo className={cx('byline')} author={author} date={date} />
          </div>
        </div>
      )}

      {image && (
        <div className={cx('image')}>
          <div>
            <FeaturedImage
              className={cx('featured-image')}
              image={image}
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
}
