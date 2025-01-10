import React, { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Trash, LoaderCircle } from "lucide-react";
import { Textarea } from "./components/ui/textarea";

// Define types for the state
interface Article {
  title: string;
  content: string;
}

interface ArticleHTMLInputs {
  number_of_sections: number;
  words_per_section: number[];
  image_urls: { image: string; credit: string }[];
  curr_image: string;
  curr_credit: string;
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
    curr_credit: "",
    main_article: "",
  });

  const [articlHTML, setArticleHTML] = useState<{ html_output?: string }>({}); // Added type for article HTML

  const [confirmPublish, setConfirmPublish] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Added state for error message

  const publishToNexis = async () => {
    if (confirmPublish === "CONFIRM") {
      setErrorMessage(null); // Clear any previous error
      try {
        await axios.post("http://localhost:5000/publish-article", {
          article: articlHTML.html_output,
        });
        console.log("Article published successfully");
      } catch (error) {
        console.error("Error publishing article:", error);
      }
    } else {
      setErrorMessage("Please write 'CONFIRM' to publish."); // Set error message
      console.error("Please confirm to publish");
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    // Added type for event
    const { name, value } = e.target;
    setArticle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [generateArticleLoading, setGenerateArticleLoading] = useState(false);
  const [generateArticleHTMLLoading, setGenerateArticleHTMLLoading] =
    useState(false);

  const generateHTML = async () => {
    try {
      setGenerateArticleHTMLLoading(true);
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
      setGenerateArticleHTMLLoading(false);
    } catch (e) {
      console.error("Error generating HTML:", e);
    }
  };

  const generateArticle = async () => {
    try {
      setGenerateArticleLoading(true);
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
      setGenerateArticleLoading(false);
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

            <Button type="submit" className="w-full">
              Generate Article
            </Button>

            {generateArticleLoading && (
              <LoaderCircle size={48} className="animate-spin mx-auto" />
            )}

            <hr className="my-4" />
          </form>

          <div className="my-2">
            <div className="space-y-2">
              <Label htmlFor="description" className="text-xl">
                Article
              </Label>
              <Textarea
                value={article.content}
                onChange={(e) =>
                  setArticle((prev) => ({
                    ...prev,
                    content: e.target.value,
                  }))
                }
                className="h-48 text-start resize-none"
              />
              {/* {!generateArticleLoading && <div>{article.content}</div>} */}
            </div>

            <div className="space-y-2 my-2">
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

            <div className="my-2 space-y-2">
              <Label htmlFor="image_urls">Images</Label>

              {/* Loading given images from url */}
              <div className="grid grid-cols-3 gap-2">
                {articlHTMLInputs.image_urls.map((item, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <img
                      src={item.image}
                      className="h-36 object-cover rounded-lg w-full"
                      alt={`Image ${index + 1}`}
                    />
                    <div className="text-sm text-gray-500 mt-1 mb-2">
                      {item.credit}
                    </div>
                    <button
                      className="bg-red-500 text-white rounded-lg w-full h-8 p-1 flex items-center justify-center space-x-2"
                      onClick={() => {
                        const updatedImages =
                          articlHTMLInputs.image_urls.filter(
                            (_, i) => i !== index
                          );
                        setArticleHTMLInputs((prev) => ({
                          ...prev,
                          image_urls: updatedImages,
                        }));
                      }}
                    >
                      <Trash size={16} />
                      <div className="font-normal text-sm">Remove</div>
                    </button>
                  </div>
                ))}
              </div>
              <div className="my-2 space-y-2">
                <Label>Add New Image</Label>
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
                    placeholder="Image URL"
                    required
                  />
                  <Input
                    id="image_credit"
                    name="image_credit"
                    value={articlHTMLInputs.curr_credit} // Assuming you add a new state for credit
                    onChange={(e) => {
                      setArticleHTMLInputs((prev) => ({
                        ...prev,
                        curr_credit: e.target.value,
                      }));
                    }}
                    placeholder="Image Credit"
                    required
                  />
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      const newImage = {
                        image: articlHTMLInputs.curr_image,
                        credit: articlHTMLInputs.curr_credit,
                      };
                      const images = [...articlHTMLInputs.image_urls, newImage];

                      setArticleHTMLInputs((prev) => ({
                        ...prev,
                        curr_image: "",
                        curr_credit: "", // Reset credit input
                        image_urls: images,
                      }));
                    }}
                  >
                    Add Image
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <Button className="w-full mt-4" onClick={generateHTML}>
            Generate HTML
          </Button>
          <hr className="my-4" />
          {generateArticleHTMLLoading && (
            <LoaderCircle size={48} className="animate-spin mx-auto" />
          )}
          {!generateArticleHTMLLoading && articlHTML.html_output && (
            <div>
              <div
                dangerouslySetInnerHTML={{
                  __html: articlHTML.html_output!,
                }}
                className="animate-in transition-all"
              />
            </div>
          )}
          {!generateArticleHTMLLoading && articlHTML.html_output && (
            <div className="flex flex-col space-y-2">
              <hr />
              <Label className="text-xl font-semibold">Publish</Label>
              <Input
                placeholder="Write CONFIRM to publish"
                value={confirmPublish}
                onChange={(e) => {
                  setConfirmPublish(e.target.value);
                  setErrorMessage(null); // Clear error message on input change
                }}
              />
              {errorMessage && (
                <div className="text-red-500">{errorMessage}</div>
              )}
              <Button
                className="w-full mt-4 hover:bg-green-800"
                onClick={publishToNexis}
              >
                {" "}
                Publish to NEXIS{" "}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ArticleEditor;
