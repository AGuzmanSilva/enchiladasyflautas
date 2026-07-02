import { describe, it, expect, vi, beforeEach } from "vitest";
import { cargarJSON } from "../assets/fetch.js";

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("cargarJSON", () => {
  it("debe retornar datos parseados en una respuesta exitosa", async () => {
    const data = { productos: [{ nombre: "Taco", precio: 50 }] };
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(data)
    });

    const result = await cargarJSON("/data.json");
    expect(result).toEqual(data);
    expect(fetch).toHaveBeenCalledWith("/data.json");
  });

  it("debe lanzar error si la respuesta HTTP falla", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404
    });

    await expect(cargarJSON("/data.json", 0)).rejects.toThrow("HTTP 404");
  });

  it("debe reintentar en caso de fallo", async () => {
    globalThis.fetch = vi.fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ exito: true })
      });

    const result = await cargarJSON("/data.json", 1);
    expect(result).toEqual({ exito: true });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("debe lanzar error después de agotar los reintentos", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    await expect(cargarJSON("/data.json", 1)).rejects.toThrow("Network error");
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
