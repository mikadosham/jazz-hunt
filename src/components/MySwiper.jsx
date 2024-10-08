import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";
import { useState } from "react";

const MySwiperComponent = ({ pages }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState(null); // State to store thumbnail swiper
  const [mainSwiper, setMainSwiper] = useState(null); // State to store main swiper

  const resetSwiper = () => {
    setPages([]); // Clear the pages array

    // Reset the thumbnail Swiper if it's initialized
    if (thumbsSwiper) {
      thumbsSwiper.slideTo(0); // Reset to the first slide
      thumbsSwiper.update(); // Update the swiper instance to reflect the current state
    }

    // Reset the main Swiper if it's initialized
    if (mainSwiper) {
      mainSwiper.slideTo(0); // Reset to the first slide
      mainSwiper.update(); // Update the swiper instance
    }
  };

  return (
    <div className="swiper-container">
      {/* Main Swiper */}
      <div className="main-swiper">
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          lazy={"true"}
          modules={[Navigation, Thumbs]} // Ensure Thumbs module is imported
          thumbs={{ swiper: thumbsSwiper }} // Pass the thumbsSwiper instance here
          onSwiper={(swiper) => setMainSwiper(swiper)} // Capture main swiper instance
        >
          {pages.map((page, index) => (
            <SwiperSlide key={index}>
              <img
                src={page}
                alt={`Page ${index + 1}`}
                style={{ width: "100%", height: "auto" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Thumbnail Swiper */}
      <div className="thumbs-swiper">
        <Swiper
          modules={[Thumbs]} // Thumbs module must be imported here
          watchSlidesProgress
          onSwiper={(swiperInstance) => {
            setThumbsSwiper(swiperInstance); // Set the thumbnail Swiper instance once initialized
          }}
          direction="vertical" // Display thumbnails vertically
          spaceBetween={10}
          slidesPerView={4}
        >
          {pages.map((page, index) => (
            <SwiperSlide key={index}>
              <img
                src={page}
                alt={`Thumbnail ${index + 1}`}
                style={{ width: "100%", height: "auto" }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default MySwiperComponent;
