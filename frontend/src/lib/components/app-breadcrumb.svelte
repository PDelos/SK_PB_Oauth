<script lang="ts">
    import { page } from '$app/state';
    import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
    import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

    const VISIBLE_LEFT = 1;
    const VISIBLE_RIGHT = 0; // this excludes the current page link
    

    let open = $state(false);

    const pathname = $derived(page.url.pathname);
    const segments = $derived(pathname.split('/').filter(Boolean));

    const items = $derived([
        ...segments.map((segment, index) => {
            const href = '/' + segments.slice(0, index + 1).join('/');
            const label = segment
            .replace(/-/g, ' ')
            .replace(/^\w/, c => c.toUpperCase());
            return { href, label };
        })
    ]);

    
    // Calculate indices to ensure no overlap
    const leftEndIndex = $derived(Math.min(VISIBLE_LEFT, items.length-1));
    const rightStartIndex = $derived(Math.max(leftEndIndex, items.length-1 - VISIBLE_RIGHT));
    
    // Get current page (last item)
    const currentPage = $derived(items[items.length - 1]);
    
    // Get visible left items (limited by leftEndIndex)
    const visibleItemsLeft = $derived(items.slice(0, leftEndIndex));
    
    // Get visible right items (starting from rightStartIndex, excluding last item)
    const visibleItemsRight = $derived(
        rightStartIndex < items.length - 1 ? items.slice(rightStartIndex, -1) : []
    );
    
    // Calculate dropdown items (between left and right visible items)
    const dropdownItems = $derived(
        leftEndIndex < rightStartIndex ? items.slice(leftEndIndex, rightStartIndex) : []
    );
</script>

<Breadcrumb.Root>
    <Breadcrumb.List>
        <!-- First items -->
        {#each visibleItemsLeft as { href, label } (href)}
        <Breadcrumb.Item>
            <Breadcrumb.Link href={href}>{label}</Breadcrumb.Link>
            <Breadcrumb.Separator />
        </Breadcrumb.Item>
        {/each}

        <!-- Dropdown if needed -->
        {#if dropdownItems.length}
        <Breadcrumb.Item>
            <DropdownMenu.Root>
            <DropdownMenu.Trigger class="flex items-center gap-1 cursor-pointer hover:text-accent" aria-label="Toggle menu">
                <Breadcrumb.Ellipsis class="size-4" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="start">
                {#each dropdownItems as { href, label } (href)}
                    <DropdownMenu.Item>
                        <a class="w-full h-full" href={href}>{label}</a>
                    </DropdownMenu.Item>
                {/each}
            </DropdownMenu.Content>
            </DropdownMenu.Root>
            <Breadcrumb.Separator />
        </Breadcrumb.Item>
        {/if}

        <!-- Any remaining middle visible items -->
        {#each visibleItemsRight as { href, label } (href)}
        <Breadcrumb.Item>
            <Breadcrumb.Link href={href}>{label}</Breadcrumb.Link>
            <Breadcrumb.Separator />
        </Breadcrumb.Item>
        {/each}

        <!-- Last item (always plain text) -->
        <Breadcrumb.Item>
        <Breadcrumb.Page>{currentPage.label}</Breadcrumb.Page>
        </Breadcrumb.Item>
    </Breadcrumb.List>
</Breadcrumb.Root>