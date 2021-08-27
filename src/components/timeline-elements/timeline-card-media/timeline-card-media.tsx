import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { CardMediaModel } from '../../../models/TimelineMediaModel';
import { GlobalContext } from '../../GlobalContext';
import { MemoSubTitle, MemoTitle } from '../memoized';
import {
  CardImage,
  CardVideo,
  ErrorMessage,
  IFrameVideo,
  MediaDetailsWrapper,
  MediaWrapper,
} from './timeline-card-media.styles';

interface ErrorMessageModel {
  message: string;
}

const CardMedia: React.FunctionComponent<CardMediaModel> = ({
  active,
  id,
  onMediaStateChange,
  theme,
  title,
  content,
  media,
  slideshowActive,
  hideMedia = false,
  cardHeight,
}: CardMediaModel) => {
  const [loadFailed, setLoadFailed] = useState(false);

  const { mode } = useContext(GlobalContext);

  const [mediaLoaded, setMediaLoaded] = useState(false);

  const handleMediaLoaded = useCallback(() => {
    setMediaLoaded(true);
  }, []);

  const handleError = useCallback(() => {
    setLoadFailed(true);
    onMediaStateChange({
      id,
      paused: false,
      playing: false,
    });
  }, []);

  const ErrorMessageMem: React.FunctionComponent<ErrorMessageModel> =
    React.memo(({ message }: ErrorMessageModel) => (
      <ErrorMessage>{message}</ErrorMessage>
    ));

  const isYouTube = useMemo(
    () =>
      /^(https?\:\/\/)?(www\.youtube\.com|youtu\.?be)\/.+$/.test(
        media.source.url,
      ),
    [],
  );

  const IFrameYouTube = useMemo(
    () => (
      <IFrameVideo
        frameBorder="0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        src={`${media.source.url}${'?enablejsapi=1'}`}
      />
    ),
    [active],
  );

  const Video = useMemo(() => {
    return (
      <CardVideo
        controls
        autoPlay={false}
        onLoadedData={handleMediaLoaded}
        onPlay={() =>
          onMediaStateChange({
            id,
            paused: false,
            playing: true,
          })
        }
        onPause={() =>
          onMediaStateChange({
            id,
            paused: true,
            playing: false,
          })
        }
        onEnded={() =>
          onMediaStateChange({
            id,
            paused: false,
            playing: false,
          })
        }
        onError={handleError}
      >
        <source src={media.source.url}></source>
      </CardVideo>
    );
  }, [active]);

  const Image = useMemo(() => {
    return (
      <CardImage
        src={media.source.url}
        mode={mode}
        onLoad={handleMediaLoaded}
        onError={handleError}
        visible={mediaLoaded}
        active={active}
        alt={media.name}
        loading={'lazy'}
      />
    );
  }, [active, mediaLoaded]);

  ErrorMessageMem.displayName = 'Error Message';

  return (
    <>
      <MediaWrapper
        theme={theme}
        active={active}
        mode={mode}
        slideShowActive={slideshowActive}
        className="card-media-wrapper"
        cardHeight={cardHeight}
      >
        {media.type === 'VIDEO' &&
          !isYouTube &&
          (!loadFailed ? (
            Video
          ) : (
            <ErrorMessageMem message="Failed to load the video" />
          ))}
        {media.type === 'VIDEO' && isYouTube && IFrameYouTube}
        {media.type === 'IMAGE' &&
          (!loadFailed ? (
            Image
          ) : (
            <ErrorMessageMem message="Failed to load the image." />
          ))}
      </MediaWrapper>
      <MediaDetailsWrapper mode={mode}>
        <MemoTitle title={title} theme={theme} active={active} />
        <MemoSubTitle content={content} />
      </MediaDetailsWrapper>
    </>
  );
};

export default CardMedia;
