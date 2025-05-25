import React, { useState } from 'react';
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  InlineButton,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Checkbox,
  RangeSlider,
  ExpandingTextarea,
  Input,
  Select,
  RadioGroup,
  Heading,
  Subheading,
  Paragraph,
  Text
} from '../components/ui';

const ComponentsDemo: React.FC = () => {
  // State for form elements
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [rangeValue, setRangeValue] = useState(50);
  const [textareaValue, setTextareaValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [selectValue, setSelectValue] = useState('option1');
  const [radioValue, setRadioValue] = useState('option1');

  // Options for Select
  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  // Options for RadioGroup
  const radioOptions = [
    { value: 'option1', label: 'Option 1', description: 'This is option 1' },
    { value: 'option2', label: 'Option 2', description: 'This is option 2' },
    { value: 'option3', label: 'Option 3', description: 'This is option 3' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <Heading level={1} className="mb-8">UI Components Demo</Heading>

      {/* Buttons Section */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Buttons</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Heading level={3}>Button Variants</Heading>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Subheading level={3} className="mb-2">Primary Button</Subheading>
                <PrimaryButton>Primary Button</PrimaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Secondary Button</Subheading>
                <SecondaryButton>Secondary Button</SecondaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Outline Button</Subheading>
                <Button variant="outline">Outline Button</Button>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Ghost Button</Subheading>
                <Button variant="ghost">Ghost Button</Button>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Link Button</Subheading>
                <InlineButton>Link Button</InlineButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Destructive Button</Subheading>
                <Button variant="destructive">Destructive Button</Button>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Success Button</Subheading>
                <Button variant="success">Success Button</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3}>Button States & Sizes</Heading>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Subheading level={3} className="mb-2">Loading State</Subheading>
                <PrimaryButton isLoading>Loading Button</PrimaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Disabled State</Subheading>
                <PrimaryButton disabled>Disabled Button</PrimaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Full Width</Subheading>
                <PrimaryButton fullWidth>Full Width Button</PrimaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Small Size</Subheading>
                <PrimaryButton size="sm">Small Button</PrimaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Medium Size (Default)</Subheading>
                <PrimaryButton size="md">Medium Button</PrimaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Large Size</Subheading>
                <PrimaryButton size="lg">Large Button</PrimaryButton>
              </div>
              <div>
                <Subheading level={3} className="mb-2">Extra Large Size</Subheading>
                <PrimaryButton size="xl">Extra Large Button</PrimaryButton>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cards Section */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Cards</Heading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Heading level={3}>Default Card</Heading>
            </CardHeader>
            <CardContent>
              <Paragraph>This is a default card with header, content, and footer.</Paragraph>
            </CardContent>
            <CardFooter>
              <Text size="sm" variant="muted">Card Footer</Text>
            </CardFooter>
          </Card>

          <Card variant="bordered">
            <CardHeader>
              <Heading level={3}>Bordered Card</Heading>
            </CardHeader>
            <CardContent>
              <Paragraph>This is a bordered card with header, content, and footer.</Paragraph>
            </CardContent>
            <CardFooter>
              <Text size="sm" variant="muted">Card Footer</Text>
            </CardFooter>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <Heading level={3}>Elevated Card</Heading>
            </CardHeader>
            <CardContent>
              <Paragraph>This is an elevated card with header, content, and footer.</Paragraph>
            </CardContent>
            <CardFooter>
              <Text size="sm" variant="muted">Card Footer</Text>
            </CardFooter>
          </Card>
        </div>
      </section>

      {/* Form Elements Section */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Form Elements</Heading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Heading level={3}>Basic Form Elements</Heading>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Text Input"
                placeholder="Enter some text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                helperText="This is a helper text"
              />

              <Select
                label="Select Input"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                helperText="Select an option"
              />

              <Checkbox
                label="Checkbox"
                checked={checkboxValue}
                onChange={(e) => setCheckboxValue(e.target.checked)}
                description="This is a checkbox description"
              />

              <RadioGroup
                label="Radio Group"
                name="radio-demo"
                options={radioOptions}
                value={radioValue}
                onChange={setRadioValue}
                helperText="Select one option"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Heading level={3}>Advanced Form Elements</Heading>
            </CardHeader>
            <CardContent className="space-y-4">
              <RangeSlider
                label="Range Slider"
                min={0}
                max={100}
                value={rangeValue}
                onChange={setRangeValue}
                valueSuffix="%"
              />

              <ExpandingTextarea
                label="Expanding Textarea"
                placeholder="Type something here..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                helperText="This textarea expands as you type"
                minRows={3}
                maxRows={10}
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Typography Section */}
      <section className="mb-12">
        <Heading level={2} className="mb-4">Typography</Heading>
        <Card>
          <CardHeader>
            <Heading level={3}>Typography Elements</Heading>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Subheading level={3} className="mb-2">Headings</Subheading>
              <div className="space-y-2">
                <Heading level={1}>Heading 1</Heading>
                <Heading level={2}>Heading 2</Heading>
                <Heading level={3}>Heading 3</Heading>
                <Heading level={4}>Heading 4</Heading>
                <Heading level={5}>Heading 5</Heading>
                <Heading level={6}>Heading 6</Heading>
              </div>
            </div>

            <div>
              <Subheading level={3} className="mb-2">Subheadings</Subheading>
              <div className="space-y-2">
                <Subheading level={1}>Subheading 1</Subheading>
                <Subheading level={2}>Subheading 2</Subheading>
                <Subheading level={3}>Subheading 3</Subheading>
              </div>
            </div>

            <div>
              <Subheading level={3} className="mb-2">Paragraphs</Subheading>
              <div className="space-y-2">
                <Paragraph size="sm">Small paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Paragraph>
                <Paragraph size="md">Medium paragraph text (default). Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Paragraph>
                <Paragraph size="lg">Large paragraph text. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Paragraph>
              </div>
            </div>

            <div>
              <Subheading level={3} className="mb-2">Text Variants</Subheading>
              <div className="space-y-2">
                <Text variant="default">Default text</Text><br />
                <Text variant="primary">Primary text</Text><br />
                <Text variant="secondary">Secondary text</Text><br />
                <Text variant="muted">Muted text</Text><br />
                <Text variant="error">Error text</Text><br />
                <Text variant="success">Success text</Text><br />
                <Text variant="warning">Warning text</Text>
              </div>
            </div>

            <div>
              <Subheading level={3} className="mb-2">Text Weights</Subheading>
              <div className="space-y-2">
                <Text weight="normal">Normal weight text</Text><br />
                <Text weight="medium">Medium weight text</Text><br />
                <Text weight="semibold">Semibold weight text</Text><br />
                <Text weight="bold">Bold weight text</Text>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default ComponentsDemo;
