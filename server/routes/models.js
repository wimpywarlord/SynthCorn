import express from "express";

const router = express.Router();

router.get("/", async (req, res) => {
  const { supabaseClient } = req;

  try {
    const { data, error } = await supabaseClient.from("models").select(`
        id,
        name,
        model_thumbnail_image_src,
        model_prompt,
        likes,
        stans,
        impress_threshold,
        created_at,
        model_image_gallery (
          id,
          image_url,
          created_at
        )
      `);

    if (error) throw error;

    // Log the data to check its structure
    console.log("Fetched data:", JSON.stringify(data, null, 2));

    // Transform the data to limit gallery to 3 images
    const transformedData = data.map((model) => ({
      ...model,
      model_image_gallery: model.model_image_gallery.slice(0, 3), // Take first 3 elements
    }));

    res.send(transformedData);
  } catch (error) {
    console.error(
      "%cserver/routes/models.js:10 error",
      "color: #007acc;",
      error
    );
    res.status(500).send({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { supabaseClient } = req;
  const { id } = req.params;

  try {
    const { data: model, error } = await supabaseClient
      .from("models")
      .select(
        `
        *,
        kinks (
          id,
          kink
        ),
        categories (
          id,
          category
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }

    res.json(model);
  } catch (error) {
    console.error("Error fetching model details:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
