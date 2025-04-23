import { cn } from '@/lib/utils'
import { useTheme } from '@/components/provider/theme-provider'
import { DarkMode } from './dark-mode'
import { LightMode } from './light-mode'
import { SystemMode } from './system-mode'

const SwitchTheme = () => {
    const { setTheme, theme } = useTheme()
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
            <div className="lg:col-span-4 flex lg:flex-row flex-col items-start gap-5">
                <div
                    className={cn(
                        'rounded-2xl overflow-hidden cursor-pointer border-4 border-transparent',
                        theme == 'system' && 'border-purple-800'
                    )}
                    onClick={() => setTheme('system')}
                >
                    <SystemMode />
                </div>
                <div
                    className={cn(
                        'rounded-2xl overflow-hidden cursor-pointer border-4 border-transparent',
                        theme == 'light' && 'border-purple-800'
                    )}
                    onClick={() => setTheme('light')}
                >
                    <LightMode />
                </div>
                <div
                    className={cn(
                        'rounded-2xl overflow-hidden cursor-pointer border-4 border-transparent',
                        theme == 'dark' && 'border-purple-800'
                    )}
                    onClick={() => setTheme('dark')}
                >
                    <DarkMode />
                </div>
            </div>
        </div>
    )
}

export default SwitchTheme