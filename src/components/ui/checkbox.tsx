import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckboxProps {
	checked?: boolean;
	onCheckedChange?: (checked: boolean) => void;
	className?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
	({ checked, onCheckedChange, className, ...props }, ref) => (
		<div className="relative inline-flex items-center">
			<input
				type="checkbox"
				ref={ref}
				checked={checked}
				onChange={(e) => onCheckedChange?.(e.target.checked)}
				className={cn(
					'h-4 w-4 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 checked:bg-[#FF4757] checked:border-[#FF4757] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4757] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
					className
				)}
				{...props}
			/>
		</div>
	)
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
