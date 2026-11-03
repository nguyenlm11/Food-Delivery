import { Search as SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ButtonGroup } from "@/components/ui/button-group"

interface SearchProps {
    value: string
    onChange: (value: string) => void
    onSearch: () => void
    placeholder?: string
}

function Search({ value, onChange, onSearch, placeholder = "Tìm kiếm..." }: SearchProps) {
    return (
        <form
            className="flex w-full items-center gap-2"
            onSubmit={(event) => {
                event.preventDefault()
                onSearch()
            }}
        >
            <ButtonGroup className="w-full flex-1">
                <Input
                    className="h-9 w-full min-w-0 flex-1"
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                />
                <Button type="submit" size="lg" className="shrink-0 px-3" aria-label="Tìm kiếm">
                    <SearchIcon className="size-4" />
                </Button>
            </ButtonGroup>
        </form>
    )
}

export default Search
