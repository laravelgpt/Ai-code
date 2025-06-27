export const defaultJSCode = `// Welcome to the AI Code Workbench!
// Select code and use the AI tools above.
// Or just write code and run it.

function greet(name) {
  console.log(\`Hello, \${name}!\`);
  // Try fixing this typo: console.lg("This is a test.");
  return \`Greetings, \${name}\`;
}

const message = greet('Developer');
console.log(message);
`;

export const defaultPythonCode = `# Welcome to the AI Code Workbench!
# Select code and use the AI tools above.
# Or just write code and run it.

def greet(name):
  print(f"Hello, {name}!")
  # AI execution for Python is not supported in this demo.
  # But you can still use the AI tools!
  return f"Greetings, {name}"

message = greet('Developer')
print(message)
`;

export const defaultTSCode = `// You can write TypeScript and React code here!
import React from 'react';

type GreetingProps = {
  name: string;
};

const Greeting: React.FC<GreetingProps> = ({ name }) => {
  return <h1>Hello, {name}!</h1>;
};

// TS/React execution is not supported, but you can use AI tools.
console.log(<Greeting name="TypeScript Developer" />);
`;

export const defaultHTMLCode = `<!-- Write your HTML code here -->
<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>

  <h1>Welcome to my website</h1>
  <p>This is a paragraph.</p>

</body>
</html>
`;

export const defaultCSSCode = `/* Write your CSS code here */

body {
  font-family: sans-serif;
  background-color: #f0f0f0;
}

h1 {
  color: #333;
}
`;
