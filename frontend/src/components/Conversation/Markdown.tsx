import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

const components: Partial<Components> = {
  table: ({ ...props }) => (
    <div className='my-6 w-full overflow-x-auto rounded-none border border-gray-200 shadow-none'>
      <table className='min-w-full table-auto border-collapse' {...props} />
    </div>
  ),
  thead: ({ ...props }) => <thead className='' {...props} />,
  th: ({ ...props }) => (
    <th
      className='min-w-[120px] px-6 py-4 text-left text-sm font-medium tracking-wider whitespace-nowrap uppercase'
      {...props}
    />
  ),
  td: ({ ...props }) => (
    <td
      className='min-w-[180px] border-b border-gray-100 px-6 py-4 text-sm text-gray-700 transition-colors'
      {...props}
    />
  ),
  tr: ({ ...props }) => (
    <tr
      className='transition-colors duration-150 even:bg-gray-50/50 hover:bg-blue-50'
      {...props}
    />
  ),
  caption: ({ ...props }) => (
    <caption
      className='border-t border-gray-200 bg-gray-50 py-2 text-sm font-medium text-gray-500'
      {...props}
    />
  ),
  pre: ({ children }) => <>{children}</>,
  ol: ({ node, children, ...props }) => {
    return (
      <ol className='my-4 ml-6 list-outside list-decimal space-y-1' {...props}>
        {children}
      </ol>
    );
  },
  li: ({ node, children, ...props }) => {
    return (
      <li className='py-1.5' {...props}>
        {children}
      </li>
    );
  },
  ul: ({ node, children, ...props }) => {
    return (
      <ul className='my-4 ml-6 list-outside list-disc space-y-1' {...props}>
        {children}
      </ul>
    );
  },
  strong: ({ node, children, ...props }) => {
    return (
      <span className='font-semibold text-gray-900' {...props}>
        {children}
      </span>
    );
  },
  a: ({ node, children, ...props }) => {
    return (
      <a
        className='text-blue-600 transition-colors hover:text-blue-800 hover:underline'
        target='_blank'
        rel='noreferrer'
        {...props}
      >
        {children}
      </a>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1
        className='mt-8 mb-4 border-b border-gray-200 pb-2 text-3xl font-bold text-gray-900'
        {...props}
      >
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2
        className='mt-6 mb-3 border-b border-gray-100 pb-1 text-2xl font-semibold text-gray-800'
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className='mt-5 mb-3 text-xl font-semibold text-gray-800' {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className='mt-4 mb-2 text-lg font-medium text-gray-700' {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className='mt-4 mb-2 text-base font-medium text-gray-700' {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className='mt-4 mb-2 text-sm font-medium text-gray-600' {...props}>
        {children}
      </h6>
    );
  },
  p: ({ node, children, ...props }) => {
    return (
      <p className='mb-4 text-gray-700' {...props}>
        {children}
      </p>
    );
  },
};

const remarkPlugins = [remarkGfm];
const rehypePlugins = [rehypeRaw, rehypeSanitize];

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
