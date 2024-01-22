export function generatePaginationArray(maxPage: number, currentPage: number) {
  const paginationArray: {
    title: string | number,
    active:boolean,
    link: number | null
  }[] = []

  // Always include the first page
  paginationArray.push({
    title: 1,
    active: 1 == currentPage,
    link: 1
  })

  // Calculate the range of pages to show around the current page
  const pagesToShow = 1
  const startPage = Math.max(2, currentPage - pagesToShow)
  const endPage = Math.min(maxPage - 1, currentPage + pagesToShow)

  // Add '...' before pages if there are gaps
  if (startPage > 2) {
    paginationArray.push({
      title: '...',
      active: false,
      link: null
    })
  }

  // Add the range of visible pages
  for (let page = startPage; page <= endPage; page++) {
    paginationArray.push({
      title: page,
      active: page == currentPage,
      link: page
    });
  }

  // Add '...' after pages if there are gaps
  if (endPage < maxPage - 1) {
    paginationArray.push({
      title: '...',
      active: false,
      link: null
    });
  }

  // Always include the last page
  if (maxPage > 1) {
    paginationArray.push({
      title: maxPage,
      active: currentPage == maxPage,
      link: maxPage
    });
  }

  return paginationArray;
}