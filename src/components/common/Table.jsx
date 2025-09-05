import * as React from "react"

function Table({ className, ...props }) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-x-auto">
      <table
        data-slot="table"
        className="w-full caption-bottom text-sm"
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }) {
  return (
    <thead
      data-slot="table-header"
      className="[&_tr]:border-b"
      {...props}
    />
  )
}

function TableBody({ className, ...props }) {
  return (
    <tbody
      data-slot="table-body"
      className="[&_tr]:last-child:border-0"
      {...props}
    />
  )
}

function TableFooter({ className, ...props }) {
  return (
    <tfoot
      data-slot="table-footer"
      className="[&>tr]:last:border-b-0"
      {...props}
    />
  )
}

function TableRow({ className, ...props }) {
  return (
    <tr
      data-slot="table-row"
      className="hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors"
      {...props}
    />
  )
}

function TableHead({ className, ...props }) {
  return (
    <th
      data-slot="table-head"
      className="[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap"
      {...props}
    />
  )
}

function TableCell({ className, ...props }) {
  return (
    <td
      data-slot="table-cell"
      className="[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] p-2 align-middle whitespace-nowrap"
      {...props}
    />
  )
}

function TableCaption({ className, ...props }) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
