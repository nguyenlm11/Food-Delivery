import { Search as SearchIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SearchProps {
    value: string
    onChange: (value: string) => void
    onSearch: () => void
    placeholder?: string
}

function Search({ value, onChange, onSearch, placeholder }: SearchProps) {
    return (
        <form
            className="relative w-full"
            onSubmit={(event) => {
                event.preventDefault()
                onSearch()
            }}
        >
            <SearchIcon
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
            />

            <Input
                className="h-10 w-full rounded-xl border-border-default bg-background-surface pr-24 pl-9 transition-colors hover:border-border-strong focus-visible:border-ring"
                value={value}
                onChange={(event) => onChange(event.target.value)}
                placeholder={placeholder}
                aria-label={placeholder}
            />

            {value && (
                <button
                    type="button"
                    onClick={() => {
                        onChange("")
                        onSearch()
                    }}
                    className="absolute top-1/2 right-17 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                    <X className="size-3.5" />
                </button>
            )}

            <Button type="submit" size="lg" className="absolute top-1/2 right-1 h-8 -translate-y-1/2 rounded-lg px-3">
                <SearchIcon className="size-4" />
                Tìm
            </Button>
        </form>
    )
}

export default Search
