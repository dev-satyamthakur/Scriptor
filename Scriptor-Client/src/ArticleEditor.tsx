import React, { useState, ChangeEvent, FormEvent } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";
import { Trash, LoaderCircle, Loader2, CheckCircle } from "lucide-react";
import { Textarea } from "./components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Define types for the state
interface Article {
  title: string;
  content: string;
}

interface ImageUrl {
  image: string;
  credit: string;
}

interface ArticleHTMLInputs {
  number_of_sections: number;
  words_per_section: number[];
  image_urls: ImageUrl[];
  curr_image: string;
  curr_credit: string;
  main_article: string;
}

interface PublishArticleFields {
  title: string;
  thumbnail_url: string;
  html_string: string;
}

interface ArticleHTML {
  html_output?: string;
}

const ArticleEditor: React.FC = () => {
  const [article, setArticle] = useState<Article>({
    title: "",
    content: "",
  });

  const [articleHTMLInputs, setArticleHTMLInputs] = useState<ArticleHTMLInputs>(
    {
      number_of_sections: 0,
      words_per_section: [],
      image_urls: [],
      curr_image: "",
      curr_credit: "",
      main_article: "",
    }
  );

  const [publishArticleFields, setPublishArticleFields] =
    useState<PublishArticleFields>({
      title: "",
      thumbnail_url: "",
      html_string: "",
    });

  const [articleHTML, setArticleHTML] = useState<ArticleHTML>({});

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showThumbnail, setShowThumbnail] = useState(false);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const [articlePublished, setArticlePublished] = useState(false);

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedArticle, setPublishedArticle] = useState(false);

  const [generateArticleLoading, setGenerateArticleLoading] = useState(false);
  const [generateArticleHTMLLoading, setGenerateArticleHTMLLoading] =
    useState(false);

  const publishToNexis = async () => {
    setErrorMessage(null);
    setIsPublishing(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/publish-article",
        publishArticleFields
      );
      if (res.status === 200) {
        setArticlePublished(true);
        setPublishedArticle(true);
        console.log("Article published successfully");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to publish article. Please try again.";
      setErrorMessage(errorMsg);
      console.error("Error publishing article:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setArticle((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const generateHTML = async () => {
    setGenerateArticleHTMLLoading(true);
    setErrorMessage(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/generate-article-html",
        {
          number_of_sections: articleHTMLInputs.number_of_sections,
          words_per_section: articleHTMLInputs.words_per_section,
          image_urls: articleHTMLInputs.image_urls,
          main_article: article.content,
        }
      );
      setArticleHTML(response.data);
      setPublishArticleFields((prev) => ({
        ...prev,
        html_string: response.data.html_output,
      }));
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to generate HTML. Please try again.";
      setErrorMessage(errorMsg);
      console.error("Error generating HTML:", error);
    } finally {
      setGenerateArticleHTMLLoading(false);
    }
  };

  const generateArticle = async () => {
    setGenerateArticleLoading(true);
    setErrorMessage(null);
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
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message ||
        "Failed to generate article. Please try again.";
      setErrorMessage(errorMsg);
      console.error("Error generating article:", error);
    } finally {
      setGenerateArticleLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await generateArticle();
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
              <Label htmlFor="content" className="text-xl">
                Article
              </Label>
              <Textarea
                id="content"
                name="content"
                value={article.content}
                onChange={handleChange}
                className="h-48 text-start resize-none"
              />
            </div>

            <div className="space-y-2 my-2">
              <Label htmlFor="number_of_sections">Number of Sections</Label>
              <Input
                id="number_of_sections"
                name="number_of_sections"
                value={articleHTMLInputs.number_of_sections}
                onChange={(e) =>
                  setArticleHTMLInputs((prev) => ({
                    ...prev,
                    number_of_sections: Number(e.target.value),
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
                value={articleHTMLInputs.words_per_section.join(",")}
                onChange={(e) =>
                  setArticleHTMLInputs((prev) => ({
                    ...prev,
                    words_per_section: e.target.value.split(",").map(Number),
                  }))
                }
                placeholder="Words per Section"
                required
              />
            </div>

            <div className="my-2 space-y-2">
              <Label htmlFor="image_urls">Images</Label>

              <div className="grid grid-cols-3 gap-2">
                {articleHTMLInputs.image_urls.map((item, index) => (
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
                          articleHTMLInputs.image_urls.filter(
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
                    value={articleHTMLInputs.curr_image}
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
                    value={articleHTMLInputs.curr_credit}
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
                        image: articleHTMLInputs.curr_image,
                        credit: articleHTMLInputs.curr_credit,
                      };
                      const images = [
                        ...articleHTMLInputs.image_urls,
                        newImage,
                      ];

                      setArticleHTMLInputs((prev) => ({
                        ...prev,
                        curr_image: "",
                        curr_credit: "",
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
          {!generateArticleHTMLLoading && articleHTML.html_output && (
            <div>
              <div
                dangerouslySetInnerHTML={{
                  __html: articleHTML.html_output,
                }}
                className="animate-in transition-all"
              />
            </div>
          )}
          <hr className="my-4" />
          {articleHTML.html_output && (
            <div className="flex flex-col space-y-2">
              <Label className="text-xl font-semibold">Publish Article</Label>

              <Label className="text-lg">Enter the title of the article</Label>
              <Input
                placeholder="Title"
                value={publishArticleFields.title}
                onChange={(e) =>
                  setPublishArticleFields({
                    ...publishArticleFields,
                    title: e.target.value,
                  })
                }
              />

              <Label className="text-lg">Thumbnail image</Label>
              {publishArticleFields.thumbnail_url && showThumbnail && (
                <div className="flex flex-col space-y-2 justify-center items-center">
                  <img
                    src={publishArticleFields.thumbnail_url}
                    alt="thumbnail"
                    className="object-cover rounded-lg w-full h-96"
                  />
                  <button
                    className="bg-red-500 text-white rounded-lg w-full h-8 p-1 flex items-center justify-center space-x-2"
                    onClick={() => {
                      setPublishArticleFields((prev) => ({
                        ...prev,
                        thumbnail_url: "",
                      }));
                      setShowThumbnail(false);
                    }}
                  >
                    <Trash size={16} />
                    <div className="font-normal text-sm">Remove</div>
                  </button>
                </div>
              )}
              {!showThumbnail && (
                <div className="flex justify-center items-center space-x-2">
                  <Input
                    placeholder="URL of the image"
                    onChange={(e) =>
                      setPublishArticleFields({
                        ...publishArticleFields,
                        thumbnail_url: e.target.value,
                      })
                    }
                  />
                  <Button onClick={() => setShowThumbnail(true)}>
                    Add image
                  </Button>
                </div>
              )}

              {errorMessage && (
                <div className="text-red-500">{errorMessage}</div>
              )}
              <Button
                className="w-full mt-4 hover:bg-green-800"
                onClick={() => {
                  if (!publishArticleFields.title.trim()) {
                    setErrorMessage("Title cannot be empty");
                    return;
                  }
                  if (!publishArticleFields.thumbnail_url.trim()) {
                    setErrorMessage("Please add a thumbnail image");
                    return;
                  }
                  setShowConfirmDialog(true);
                }}
              >
                Publish to NEXIS
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Publication</DialogTitle>
            <DialogDescription>
              Are you sure you want to publish this article?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <p>
                <strong>Title:</strong> {publishArticleFields.title}
              </p>
              <p className="mt-2">
                <strong>Date:</strong> {new Date().toLocaleDateString()}
              </p>
              {publishArticleFields.thumbnail_url && (
                <img
                  src={publishArticleFields.thumbnail_url}
                  alt="Thumbnail"
                  className="mt-2 w-full h-32 object-cover rounded-md"
                />
              )}
            </div>
          </div>
          <DialogFooter className="flex items-center justify-end space-x-2">
            {!isPublishing && !publishedArticle && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmDialog(false)}
                >
                  No
                </Button>
                <Button
                  onClick={async () => {
                    setIsPublishing(true);
                    await publishToNexis();
                    setIsPublishing(false);
                    setPublishedArticle(true);
                    setTimeout(() => {
                      setShowConfirmDialog(false);
                      setPublishedArticle(false);
                    }, 2000);
                  }}
                >
                  Yes
                </Button>
              </>
            )}
            {isPublishing && (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Publishing article...</span>
              </div>
            )}
            {publishedArticle && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span>Article published successfully!</span>
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArticleEditor;
