import * as React from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
	value: number[];
	onValueChange?: (value: number[]) => void;
	min?: number;
	max?: number;
	step?: number;
	className?: string;
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
	({ value, onValueChange, min = 0, max = 100, step = 1, className, ...props }, ref) => {
		const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
			const newValue = parseFloat(e.target.value);
			onValueChange?.([newValue]);
		};

		return (
			<div className={cn('relative w-full', className)}>
				<input
					type="range"
					ref={ref}
					min={min}
					max={max}
					step={step}
					value={value[0]}
					onChange={handleChange}
					className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF4757]"
					{...props}
				/>
			</div>
		);
	}
);
Slider.displayName = 'Slider';

export { Slider };
