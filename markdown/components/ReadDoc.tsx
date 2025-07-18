import { View } from 'react-native';
import React from 'react';
import Markdown from 'react-native-markdown-display';
import MathJax from 'react-native-mathjax';

const ReadingDoc = () => {
  // Function to parse content and separate markdown from math
  const parseContent = (content: string) => {
    // Split content by math blocks (display math)
    const mathBlockRegex = /(\\\[[\s\S]*?\\\])/g;
    const parts = content.split(mathBlockRegex);

    return parts.map((part, index) => {
      if (part.match(mathBlockRegex)) {
        // This is a math block
        return { type: 'math', content: part, key: `math-${index}` };
      } else {
        // This is regular content that might contain markdown
        return { type: 'text', content: part, key: `text-${index}` };
      }
    });
  };

  // Convert LaTeX formatting to Markdown
  const convertLatexToMarkdown = (latexContent: string) => {
    let markdownContent = latexContent;

    // Convert LaTeX sections to Markdown headers
    markdownContent = markdownContent.replace(
      /\\section\*\{([^}]+)\}/g,
      '## $1',
    );
    markdownContent = markdownContent.replace(/\\section\{([^}]+)\}/g, '## $1');

    // Convert LaTeX text formatting
    markdownContent = markdownContent.replace(/\\textbf\{([^}]+)\}/g, '**$1**');
    markdownContent = markdownContent.replace(/\\emph\{([^}]+)\}/g, '*$1*');
    markdownContent = markdownContent.replace(/\\textit\{([^}]+)\}/g, '*$1*');

    // Convert LaTeX itemize to Markdown list
    markdownContent = markdownContent.replace(/\\begin\{itemize\}/g, '');
    markdownContent = markdownContent.replace(/\\end\{itemize\}/g, '');
    markdownContent = markdownContent.replace(/\\item\s+/g, '- ');

    // Convert LaTeX enumerate to Markdown ordered list
    markdownContent = markdownContent.replace(/\\begin\{enumerate\}/g, '');
    markdownContent = markdownContent.replace(/\\end\{enumerate\}/g, '');
    markdownContent = markdownContent.replace(/\\item\s+/g, '1. ');

    // Convert LaTeX spacing commands
    markdownContent = markdownContent.replace(/\\vspace\{[^}]+\}/g, '\n\n');
    markdownContent = markdownContent.replace(/\\\\(?:\[[^\]]*\])?/g, '\n');

    // Convert LaTeX text commands
    markdownContent = markdownContent.replace(/\\text\{([^}]+)\}/g, '$1');
    markdownContent = markdownContent.replace(/\\quad/g, '    ');

    // Clean up extra whitespace
    markdownContent = markdownContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    return markdownContent;
  };

  const content = `
\\section*{Introduction}

\\vspace{1em}

Welcome to this lesson on solving quadratic equations by factoring! Factoring is one of the most efficient ways to solve quadratic equations, and it's a skill you'll use often in algebra and beyond. By breaking down the equation into simpler expressions, you'll learn how to find the roots of the equation quickly and effectively.

\\vspace{1em}

\\section*{Key Concepts Covered}

\\vspace{1em}

\\begin{itemize}
  \\item \\textbf{Understanding Quadratic Equations}: What are they and why are they important?
  \\item \\textbf{Factoring Basics}: Breaking down quadratic equations into their factors.
  \\item \\textbf{Zero-Product Property}: How setting each factor to zero helps find the solution.
  \\item \\textbf{Steps to Solve}: A step-by-step guide to solving quadratic equations by factoring.
\\end{itemize}

\\vspace{1em}

\\section*{Step-by-Step Guide}

\\vspace{1em}

\\begin{enumerate}
  \\item \\textbf{Rewrite the equation in standard form:}
    Example:
    \\[
    ax^2 + bx + c = 0
    \\]
    \\[
    0a x^2 + bx + c = 0
    \\]
   
  \\item \\textbf{Factor the quadratic expression:}
    Example:
    \\[
    x^2 + 5x + 6 = 0
    \\]
    Factors to:
    \\[
    (x + 2)(x + 3) = 0
    \\]
   
  \\item \\textbf{Apply the Zero-Product Property:}
    Set each factor equal to zero:
    \\[
    x + 2 = 0 \\quad \\text{or} \\quad x + 3 = 0
    \\]
   
  \\item \\textbf{Solve for \\( x \\):}
    \\[
    x = -2 \\quad \\text{or} \\quad x = -3
    \\]
\\end{enumerate}
`;

  const contentParts = parseContent(content);

  return (
    <View >
      {contentParts.map((part) => {
        if (part.type === 'math') {
          return (
            <MathJax
              key={part.key}
              html={part.content}
              mathJaxOptions={{
                messageStyle: 'none',
                extensions: ['tex2jax.js'],
                jax: ['input/TeX', 'output/HTML-CSS'],
                tex2jax: {
                  inlineMath: [
                    ['$', '$'],
                    ['\\(', '\\)'],
                  ],
                  displayMath: [
                    ['$$', '$$'],
                    ['\\[', '\\]'],
                  ],
                  processEscapes: true,
                },
                TeX: {
                  extensions: [
                    'AMSmath.js',
                    'AMSsymbols.js',
                    'noErrors.js',
                    'noUndefined.js',
                  ],
                },
              }}
            />
          );
        } else {
          const markdownContent = convertLatexToMarkdown(part.content);
          return <Markdown key={part.key}>{markdownContent}</Markdown>;
        }
      })}
    </View>
  );
};

export default ReadingDoc;
