import Image from "next/image";
import { useState } from "react";

interface ImageZoomerProps {
    paymentImage: string
}

const MAGNIFIER_SIZE = 200;
const ZOOM_LEVEL = 2.5;

const ImageZoomer: React.FC<ImageZoomerProps> = ({
    paymentImage
}) => {

    const [zoomable, setZoomable] = useState(true);
    const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
    const [position, setPosition] = useState({ x: 100, y: 100, mouseX: 0, mouseY: 0 });

    const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
        let element = e.currentTarget;
        let { width, height } = element.getBoundingClientRect();
        setImageSize({ width, height });
        setZoomable(true);
        updatePosition(e);
    };

    const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
        setZoomable(false);
        updatePosition(e);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        updatePosition(e);
    };

    const updatePosition = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.currentTarget) {
            const { left, top } = e.currentTarget.getBoundingClientRect();
            let x = e.clientX - left;
            let y = e.clientY - top;
            setPosition({
                x: -x * ZOOM_LEVEL + (MAGNIFIER_SIZE / 2),
                y: -y * ZOOM_LEVEL + (MAGNIFIER_SIZE / 2),
                mouseX: x - (MAGNIFIER_SIZE / 2),
                mouseY: y - (MAGNIFIER_SIZE / 2),
            });
        }
    };

    return (
        <div onMouseLeave={handleMouseLeave}
            onMouseEnter={handleMouseEnter}
            onMouseMove={handleMouseMove}
            className='w-fit h-fit relative overflow-hidden'>
            <Image className="mt-4" src={paymentImage} width={250} height={300} alt="" quality={100} />
            <div
                style={{
                    backgroundPosition: `${position.x}px ${position.y}px`,
                    backgroundImage: `url(${paymentImage})`,
                    backgroundSize: `${imageSize.width * ZOOM_LEVEL}px ${imageSize.height * ZOOM_LEVEL}px`,
                    backgroundRepeat: 'no-repeat',
                    display: zoomable ? 'block' : 'none',
                    position: 'absolute',
                    top: `${position.mouseY}px`,
                    left: `${position.mouseX}px`,
                    width: `${MAGNIFIER_SIZE}px`,
                    height: `${MAGNIFIER_SIZE}px`,
                    border: '4px solid gray',
                    borderRadius: '50%',
                    pointerEvents: 'none',
                }}
            />
        </div>
    )
}

export default ImageZoomer;