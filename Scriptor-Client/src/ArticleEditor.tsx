import React, { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

// Define types for the state
interface Article {
  title: string;
  content: string;
}

interface ArticleHTMLInputs {
  number_of_sections: number;
  words_per_section: number[];
  image_urls: string[];
  curr_image: string;
  main_article: string;
}

const ArticleEditor: React.FC = () => {
  const [article, setArticle] = useState<Article>({
    title: "",
    content: "",
  });

  const [articlHTMLInputs, setArticleHTMLInputs] = useState<ArticleHTMLInputs>({
    number_of_sections: 0,
    words_per_section: [],
    image_urls: [],
    curr_image: "",
    main_article: "",
  });

  const [articlHTML, setArticleHTML] = useState<{ html_output?: string }>({}); // Added type for article HTML

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Added type for event
    const { name, value } = e.target;
    setArticle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateHTML = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-article-html",
        {
          number_of_sections: articlHTMLInputs.number_of_sections,
          words_per_section: articlHTMLInputs.words_per_section,
          image_urls: articlHTMLInputs.image_urls,
          main_article: article.content,
        }
      );
      setArticleHTML(response.data);
    } catch (e) {
      console.error("Error generating HTML:", e);
    }
  };

  const generateArticle = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-article",
        {
          topic: article.title,
        }
      );
      setArticle((prev) => ({
        ...prev,
        content: response.data.article,
      }));
    } catch (error) {
      console.error("Error generating article:", error);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    // Added type for event
    e.preventDefault();
    await generateArticle();
    // Here you would typically send the data to your backend
    console.log("Article to be published:", article);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Article</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                value={article.title}
                onChange={handleChange}
                placeholder="Article Title"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xl">
                Article
              </Label>
              <div>{article.content}</div>
            </div>

            <Button type="submit" className="w-full">
              Generate Article
            </Button>
          </form>

          <hr className="my-4" />

          <div>
            <div className="space-y-2">
              <Label htmlFor="number_of_sections">Number of Sections</Label>
              <Input
                id="number_of_sections"
                name="number_of_sections"
                value={articlHTMLInputs.number_of_sections}
                onChange={(e) =>
                  setArticleHTMLInputs((prev) => ({
                    ...prev,
                    number_of_sections: Number(e.target.value), // Convert to number
                  }))
                }
                placeholder="Number of Sections"
                required
              />
            </div>

            <div className="space-y-2 my-2">
              <Label htmlFor="words_per_section">Words per Section</Label>
              <Input
                id="words_per_section"
                name="words_per_section"
                value={articlHTMLInputs.words_per_section.join(",")} // Join for display
                onChange={(e) =>
                  setArticleHTMLInputs((prev) => ({
                    ...prev,
                    words_per_section: e.target.value.split(",").map(Number), // Convert to number array
                  }))
                }
                placeholder="Words per Section"
                required
              />
            </div>

            <div className="space-y-2 my-2">
              <Label htmlFor="image_urls">Image URLs</Label>

              {articlHTMLInputs.image_urls.map((image, index) => (
                <div key={index} className="flex space-x-2">
                  <div>{image}</div>
                </div>
              ))}

              <div className="flex space-x-2">
                <Input
                  id="image_urls"
                  name="image_urls"
                  value={articlHTMLInputs.curr_image}
                  onChange={(e) => {
                    setArticleHTMLInputs((prev) => ({
                      ...prev,
                      curr_image: e.target.value,
                    }));
                  }}
                  placeholder="Image URLs"
                  required
                />
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    const images = [...articlHTMLInputs.image_urls];
                    images.push(articlHTMLInputs.curr_image);

                    console.log("Images:", images);

                    setArticleHTMLInputs((prev) => ({
                      ...prev,
                      image_urls: images,
                    }));
                  }}
                >
                  Add Image
                </Button>
              </div>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={generateHTML}>
            Generate HTML
          </Button>
          <hr className="my-4" />
          <div
            dangerouslySetInnerHTML={{
              __html: articlHTML.html_output!,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleEditor;
